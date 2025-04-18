import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip, AutocompleteRenderInputParams, AutocompleteRenderOptionState, Button, Box, Dialog, Alert } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { useDebounce } from '../hooks/useDebounce';
import { FormulaBuilder } from './FormulaBuilder';
import api from '../services/api';

export interface Formula {
    name: string;
    formula: string;
    source: string;
    formulaOnly?: boolean;
    smiles?: string;
    noStructure?: boolean;
    warnings?: string[];
}

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
    const [inputValue, setInputValue] = useState(initialValue);
    const [options, setOptions] = useState<Formula[]>([]);
    const [loading, setLoading] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);
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

    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
    }, [value]);

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
            } else {
                throw new Error('Invalid response format: expected JSON');
            }
        } catch (error) {
            console.error('Error fetching formulas:', error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, 300);

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
                } else {
                    throw new Error('No structure or formula found');
                }
            } else {
                throw new Error('Invalid response format: expected JSON');
            }
        } catch (error) {
            console.error('Error verifying formula:', error);
            setVerificationStatus(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to verify formula',
                warnings: []
            }));
        }
    };

    useEffect(() => {
        if (autoComplete && inputValue) {
            debouncedSearch(inputValue);
        }
    }, [inputValue, autoComplete, debouncedSearch]);

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
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                    sx={{ width: '300px', ...sx }}
                    renderInput={(params: AutocompleteRenderInputParams) => (
                        <TextField
                            {...params}
                            label="Chemical Formula"
                            variant="outlined"
                            fullWidth
                            error={!!verificationStatus.error}
                            helperText={verificationStatus.error}
                        />
                    )}
                    renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: Formula) => (
                        <li {...props}>
                            <div className="flex flex-col">
                                <span>{option.name}</span>
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm text-gray-500">{option.formula}</span>
                                    {option.formulaOnly && (
                                        <Chip
                                            label="No structure available"
                                            color="warning"
                                            size="small"
                                            className="bg-amber-100 text-amber-800"
                                        />
                                    )}
                                    {!option.formulaOnly && (
                                        <Chip
                                            label={option.source}
                                            size="small"
                                            color={option.source === 'cache' ? 'primary' : 'secondary'}
                                        />
                                    )}
                                </div>
                            </div>
                        </li>
                    )}
                    loading={loading || verificationStatus.loading}
                />
                <Button
                    variant="outlined"
                    onClick={() => setShowBuilder(true)}
                    sx={{ minWidth: '120px' }}
                >
                    Build Formula
                </Button>
            </Box>

            {showWarnings && verificationStatus.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                    {verificationStatus.warnings.join(', ')}
                </Alert>
            )}

            {verificationStatus.noStructure && (
                <Chip
                    label="No structure found. Formula used instead."
                    color="warning"
                    size="small"
                    sx={{ mt: 1 }}
                />
            )}

            <Dialog
                open={showBuilder}
                onClose={() => setShowBuilder(false)}
                maxWidth="md"
                fullWidth
            >
                <FormulaBuilder
                    onClose={() => setShowBuilder(false)}
                    onConfirm={handleBuilderConfirm}
                />
            </Dialog>
        </Box>
    );
}; 