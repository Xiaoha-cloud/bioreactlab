import React, { useState, useEffect } from 'react';
import { 
    Autocomplete, 
    TextField, 
    Chip, 
    AutocompleteRenderInputParams, 
    AutocompleteRenderOptionState, 
    Button, 
    Box, 
    Dialog, 
    Alert,
    CircularProgress,
    Typography,
    Paper,
    Fade,
    Grow,
    Zoom,
    Snackbar
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { useDebounce } from '../hooks/useDebounce';
import { FormulaBuilder } from './FormulaBuilder';
import api from '../services/api';
import { animations, transitions } from '../styles/animations';

// Interface for formula data structure
export interface Formula {
    name: string;
    formula: string;
    source: string;
    formulaOnly?: boolean;
    smiles?: string;
    noStructure?: boolean;
    warnings?: string[];
}

// Props interface for FormulaAutocomplete component
interface FormulaAutocompleteProps {
    onFormulaSelect: (formula: Formula) => void;
    apiEndpoint: string;
    initialValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    autoComplete?: boolean;
    onVerify?: (formula: Formula) => Promise<void>;
    showWarnings?: boolean;
    sx?: SxProps<Theme>;
}

export const FormulaAutocomplete: React.FC<FormulaAutocompleteProps> = ({
    onFormulaSelect,
    apiEndpoint,
    initialValue = '',
    value,
    onChange,
    autoComplete = false,
    onVerify,
    showWarnings = true,
    sx
}) => {
    // State management
    const [inputValue, setInputValue] = useState(initialValue);
    const [options, setOptions] = useState<Formula[]>([]);
    const [loading, setLoading] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<{
        loading: boolean;
        error: string | null;
        warnings: string[];
        noStructure: boolean;
    }>({
        loading: false,
        error: null,
        warnings: [],
        noStructure: false
    });

    // Update input value when value prop changes
    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
    }, [value]);

    // Debounced search function
    const debouncedSearch = useDebounce(async (searchTerm: string) => {
        if (!searchTerm) {
            setOptions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`${apiEndpoint}?q=${encodeURIComponent(searchTerm)}`);
            if (response.headers['content-type']?.includes('application/json')) {
                const data = response.data;
                const processedResults = (data.results || []).map((item: Formula) => ({
                    ...item,
                    formulaOnly: item.source === 'formula' || !item.source
                }));
                setOptions(processedResults);
                setSuccess('Search completed successfully');
            } else {
                throw new Error('Invalid response format: expected JSON');
            }
        } catch (error) {
            console.error('Error fetching formulas:', error);
            setError('Failed to fetch formulas');
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, 300);

    // Formula verification handler
    const handleVerify = async (formula: Formula) => {
        setVerificationStatus(prev => ({ ...prev, loading: true, error: null, warnings: [] }));
        
        try {
            // Try formula API first
            const formulaResponse = await api.post('/formula/search/', {
                name: formula.name
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (formulaResponse.headers['content-type']?.includes('application/json')) {
                const formulaData = formulaResponse.data;
                if (formulaData.results && formulaData.results.length > 0) {
                    const updatedFormula = {
                        ...formula,
                        formula: formulaData.results[0].formula,
                        formulaSource: 'api',
                        noStructure: true,
                        verified: true,
                        warnings: ['No structure found. Formula used instead.']
                    };
                    onFormulaSelect(updatedFormula);
                    setVerificationStatus(prev => ({ ...prev, loading: false }));
                    setSuccess('Formula verified successfully');
                    return;
                }
            } else {
                throw new Error('Invalid response format: expected JSON');
            }

            // If no formula found, try structure API as fallback
            const structureResponse = await api.post('/metabolite/validate/', {
                name: formula.name,
                type: 'VMH'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (structureResponse.headers['content-type']?.includes('application/json')) {
                if (structureResponse.data.isValid && structureResponse.data.smiles) {
                    // Structure found
                    const updatedFormula = {
                        ...formula,
                        smiles: structureResponse.data.smiles,
                        noStructure: false,
                        verified: true,
                        warnings: []
                    };
                    onFormulaSelect(updatedFormula);
                    setVerificationStatus(prev => ({ ...prev, loading: false }));
                    setSuccess('Structure verified successfully');
                } else {
                    throw new Error('No structure or formula found');
                }
            } else {
                throw new Error('Invalid response format: expected JSON');
            }
        } catch (error) {
            console.error('Error verifying formula:', error);
            setError('Failed to verify formula');
            setVerificationStatus(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to verify formula',
                warnings: []
            }));
        }
    };

    // Trigger search when input changes
    useEffect(() => {
        if (autoComplete && inputValue) {
            debouncedSearch(inputValue);
        }
    }, [inputValue, autoComplete, debouncedSearch]);

    // Handle formula builder confirmation
    const handleBuilderConfirm = (formula: string) => {
        const newFormula = {
            name: formula,
            formula: formula,
            source: 'user',
            formulaOnly: true,
            noStructure: true
        };
        onFormulaSelect(newFormula);
        setShowBuilder(false);
        setSuccess('Formula built successfully');
    };

    // Render option in dropdown
    const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: Formula) => (
        <Grow in={true} timeout={300}>
            <li {...props}>
                <Box sx={{ 
                    p: 1,
                    width: '100%',
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {option.name}
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        alignItems: 'center',
                        mt: 0.5
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            {option.formula}
                        </Typography>
                        {option.formulaOnly && (
                            <Chip
                                label="No structure"
                                size="small"
                                color="warning"
                                sx={{ 
                                    bgcolor: 'warning.light',
                                    color: 'warning.dark',
                                    ...transitions.chip
                                }}
                            />
                        )}
                        {!option.formulaOnly && (
                            <Chip
                                label={option.source}
                                size="small"
                                color={option.source === 'cache' ? 'primary' : 'secondary'}
                                sx={transitions.chip}
                            />
                        )}
                    </Box>
                </Box>
            </li>
        </Grow>
    );

    // Render input field
    const renderInput = (params: AutocompleteRenderInputParams) => (
        <TextField
            {...params}
            label="Chemical Formula"
            variant="outlined"
            fullWidth
            error={!!verificationStatus.error}
            helperText={verificationStatus.error}
            InputProps={{
                ...params.InputProps,
                endAdornment: (
                    <>
                        {loading && (
                            <CircularProgress 
                                color="inherit" 
                                size={20} 
                                sx={{ 
                                    mr: 1,
                                    ...animations.spin
                                }} 
                            />
                        )}
                        {params.InputProps.endAdornment}
                    </>
                ),
            }}
            sx={{
                ...transitions.input,
                '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                        borderColor: 'primary.main',
                    },
                },
            }}
        />
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                alignItems: 'center',
                ...transitions.container
            }}>
                <Autocomplete<Formula, false, true, true>
                    freeSolo
                    options={options}
                    getOptionLabel={(option: Formula | string) => typeof option === 'string' ? option : option.name}
                    inputValue={inputValue}
                    onInputChange={(_: React.SyntheticEvent, newValue: string) => {
                        setInputValue(newValue);
                        onChange?.(newValue);
                        if (autoComplete) {
                            debouncedSearch(newValue);
                        }
                    }}
                    onChange={(_: React.SyntheticEvent, newValue: Formula | string | null) => {
                        if (newValue && typeof newValue !== 'string') {
                            onFormulaSelect(newValue);
                            if (onVerify) {
                                handleVerify(newValue);
                            }
                        }
                    }}
                    sx={{ 
                        width: '300px', 
                        ...sx,
                        '& .MuiAutocomplete-paper': {
                            ...transitions.paper
                        }
                    }}
                    renderInput={renderInput}
                    renderOption={renderOption}
                    loading={loading || verificationStatus.loading}
                    PaperComponent={({ children }) => (
                        <Paper 
                            elevation={3}
                            sx={{ 
                                ...transitions.paper,
                                '& .MuiAutocomplete-option': {
                                    py: 1
                                }
                            }}
                        >
                            {children}
                        </Paper>
                    )}
                />
                <Button
                    variant="outlined"
                    onClick={() => setShowBuilder(true)}
                    sx={{ 
                        minWidth: '120px',
                        ...transitions.button
                    }}
                >
                    Build Formula
                </Button>
            </Box>

            {showWarnings && verificationStatus.warnings.length > 0 && (
                <Zoom in={true}>
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            mt: 1,
                            ...animations.slideIn
                        }}
                    >
                        {verificationStatus.warnings.join(', ')}
                    </Alert>
                </Zoom>
            )}

            {verificationStatus.noStructure && (
                <Fade in={true}>
                    <Chip
                        label="No structure found. Formula used instead."
                        color="warning"
                        size="small"
                        sx={{ 
                            mt: 1,
                            ...transitions.chip
                        }}
                    />
                </Fade>
            )}

            <Dialog
                open={showBuilder}
                onClose={() => setShowBuilder(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        ...transitions.paper
                    }
                }}
            >
                <FormulaBuilder
                    onClose={() => setShowBuilder(false)}
                    onConfirm={handleBuilderConfirm}
                />
            </Dialog>

            {success && (
                <Snackbar
                    open={!!success}
                    autoHideDuration={3000}
                    onClose={() => setSuccess(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Zoom in={true}>
                        <Alert 
                            severity="success" 
                            sx={{ 
                                ...animations.slideIn,
                                width: '100%'
                            }}
                        >
                            {success}
                        </Alert>
                    </Zoom>
                </Snackbar>
            )}

            {error && (
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Zoom in={true}>
                        <Alert 
                            severity="error" 
                            sx={{ 
                                ...animations.slideIn,
                                width: '100%'
                            }}
                        >
                            {error}
                        </Alert>
                    </Zoom>
                </Snackbar>
            )}
        </Box>
    );
}; 