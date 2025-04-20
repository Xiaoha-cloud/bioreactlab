import * as React from 'react';
import { useState } from 'react';
import { AxiosError } from 'axios';
import api from '../services/api';
import { 
    Button, 
    TextField, 
    MenuItem, 
    Alert, 
    Container, 
    Typography, 
    Grid,
    AppBar,
    Toolbar,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Divider,
    Fade,
    Zoom,
    Box,
    Grow,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MoleculeViewer } from '../components/MoleculeViewer';
import OCL from 'openchemlib/full';
import { StandaloneStructServiceProvider } from '../services/StandaloneStructServiceProvider';
import { animations, transitions } from '../styles/animations';

interface Metabolite {
    name: string;
    stoichiometry: string;
    compartment: string;
    type: string;
    verified: boolean;
    formula?: string;
    formulaSource?: 'cache' | 'api' | 'user' | 'calculated';
    smiles?: string;
    noStructure?: boolean;
    warnings?: string[];
    id: string;
    coefficient: string;
    warning?: string;
}

interface SetStateFunction extends React.Dispatch<React.SetStateAction<Metabolite[]>> {}

interface FormulaError {
    [key: string]: string;
}

interface ErrorResponse {
    formula_errors?: FormulaError;
    [key: string]: any;
}

const CreateReactionPage: React.FC<{}> = () => {
    const [skipAtomMapping] = useState(false);
    const [substrates, setSubstrates] = useState<Metabolite[]>([{ 
        name: '', 
        stoichiometry: '1', 
        compartment: 'C', 
        type: 'VMH', 
        verified: false,
        formula: '',
        formulaSource: 'user',
        noStructure: false,
        warnings: [],
        id: '',
        coefficient: '1'
    }]);
    const [products, setProducts] = useState<Metabolite[]>([{ 
        name: '', 
        stoichiometry: '1', 
        compartment: 'C', 
        type: 'VMH', 
        verified: false,
        formula: '',
        formulaSource: 'user',
        noStructure: false,
        warnings: [],
        id: '',
        coefficient: '1'
    }]);
    const [response, setResponse] = useState<any>(null);
    const [balanceStatus, setBalanceStatus] = useState<{ balanced: boolean; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editingMetabolite, setEditingMetabolite] = useState<Metabolite | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);

    const compartments = ['C', 'M', 'Other'];
    const types = ['VMH', 'Custom'];

    const handleAddRow = (setState: SetStateFunction) => {
        setState((prev: Metabolite[]) => [...prev, { 
            name: '', 
            stoichiometry: '1', 
            compartment: 'C', 
            type: 'VMH', 
            verified: false, 
            formula: '', 
            formulaSource: 'user',
            noStructure: false,
            warnings: [],
            id: '',
            coefficient: '1'
        }]);
    };

    const handleRemoveRow = (index: number, setState: SetStateFunction) => {
        setState((prev: Metabolite[]) => prev.filter((_, i: number) => i !== index));
    };

    const handleVerify = async (index: number, setState: SetStateFunction, metabolites: Metabolite[]) => {
        const metabolite = metabolites[index];
        console.log('Verifying metabolite:', metabolite);
        
        try {
            // Try structure API first
            console.log('Calling structure API...');
            const structureResponse = await api.post('/api/metabolite/validate/', {
                name: metabolite.name,
                type: metabolite.type
            });
            console.log('Structure API response:', structureResponse.data);
            
            if (structureResponse.data.verified) {
                if (structureResponse.data.structure) {
                    console.log('Structure found, calculating formula...');
                    // Structure found - calculate formula from SMILES
                    const mol = OCL.Molecule.fromSmiles(structureResponse.data.structure);
                    const formula = mol.getMolecularFormula().formula;
                    console.log('Calculated formula:', formula);
                    
                    setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
                        i === index ? { 
                            ...item, 
                            verified: true,
                            smiles: structureResponse.data.structure,
                            formula: formula,
                            formulaSource: 'calculated',
                            noStructure: false,
                            warnings: [],
                            warning: '',
                            coefficient: '1'
                        } : item
                    ));
                } else if (structureResponse.data.formula) {
                    console.log('No structure but formula found:', structureResponse.data.formula);
                    // Try to generate structure from formula
                    try {
                        const generateResponse = await api.post('/api/formula/generate-structure/', {
                            formula: structureResponse.data.formula
                        });
                        
                        if (generateResponse.data.smiles) {
                            setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
                                i === index ? { 
                                    ...item, 
                                    verified: true,
                                    formula: structureResponse.data.formula,
                                    smiles: generateResponse.data.smiles,
                                    molfile: generateResponse.data.molfile,
                                    formulaSource: 'api',
                                    noStructure: false,
                                    warnings: ['Structure generated from formula.'],
                                    warning: 'Structure generated from formula.',
                                    coefficient: '1'
                                } : item
                            ));
                        } else {
                            // Formula found but couldn't generate structure
                            setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
                                i === index ? { 
                                    ...item, 
                                    verified: true,
                                    formula: structureResponse.data.formula,
                                    formulaSource: 'api',
                                    noStructure: true,
                                    warnings: ['No structure found. Formula used instead.'],
                                    warning: 'No structure found. Formula used instead.',
                                    coefficient: '1'
                                } : item
                            ));
                        }
                    } catch (error) {
                        console.error('Error generating structure from formula:', error);
                        setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
                            i === index ? { 
                                ...item, 
                                verified: true,
                                formula: structureResponse.data.formula,
                                formulaSource: 'api',
                                noStructure: true,
                                warnings: ['Could not generate structure from formula.'],
                                warning: 'Could not generate structure from formula.',
                                coefficient: '1'
                            } : item
                        ));
                    }
                }
                return;
            }

            // If no structure or formula from validate endpoint, try formula API
            console.log('No structure found, trying formula API...');
            const formulaResponse = await api.get(`/api/formula/search?name=${encodeURIComponent(metabolite.name)}`);
            console.log('Formula API response:', formulaResponse.data);
            
            if (formulaResponse.data.results && formulaResponse.data.results.length > 0) {
                console.log('Formula found from search API');
                // Formula found
                setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
                    i === index ? { 
                        ...item, 
                        verified: true,
                        formula: formulaResponse.data.results[0].formula,
                        formulaSource: 'api',
                        noStructure: true,
                        warnings: ['No structure found. Formula used instead.'],
                        warning: 'No structure found. Formula used instead.',
                        coefficient: '1'
                    } : item
                ));
                return;
            }

            console.log('No formula found, setting not found state');
            // No structure or formula found
            setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
                i === index ? { 
                    ...item, 
                    verified: false,
                    noStructure: true,
                    warnings: ['Not found. Please enter manually.'],
                    warning: 'Not found. Please enter manually.',
                    coefficient: '1'
                } : item
            ));
        } catch (error) {
            console.error('Error validating metabolite:', error);
            setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
                i === index ? { 
                    ...item, 
                    verified: false,
                    warnings: ['Error verifying metabolite. Please try again.'],
                    warning: 'Error verifying metabolite. Please try again.',
                    coefficient: '1'
                } : item
            ));
        }
    };

    const handleInputChange = (index: number, field: keyof Metabolite, value: string, setState: SetStateFunction) => {
        setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
            i === index ? { ...item, [field]: value, verified: false } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Verify if all metabolites have chemical formulas (if they exist)
            const allMetabolites = [...substrates, ...products];
            const invalidMetabolites = allMetabolites.filter(m => 
                m.formula && !m.verified
            );

            if (invalidMetabolites.length > 0) {
                setError(`Invalid chemical formulas found: ${invalidMetabolites.map(m => m.name).join(', ')}`);
                return;
            }

            // Prepare submission data
            const submitData = {
                substrates: substrates.map(({ name, stoichiometry, compartment, type, formula }) => ({
                    name,
                    stoichiometry: parseFloat(stoichiometry),
                    compartment,
                    type,
                    ...(formula && { formula }) // Only include formula field if it exists
                })),
                products: products.map(({ name, stoichiometry, compartment, type, formula }) => ({
                    name,
                    stoichiometry: parseFloat(stoichiometry),
                    compartment,
                    type,
                    ...(formula && { formula }) // Only include formula field if it exists
                })),
                direction: '->',
                skipAtomMapping,
                subsystem: 'Default',
                organ: 'Default'
            };

            await api.post('/api/reactions/create/', submitData);
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response?.data?.formula_errors) {
                // Handle chemical formula related errors
                const formulaErrors = error.response.data.formula_errors;
                setError(`Chemical formula validation failed: ${Object.entries(formulaErrors)
                    .map(([name, error]) => `${name}: ${error}`)
                    .join(', ')}`);
            } else {
                setError(error.response?.data?.toString() || 'An error occurred');
            }
        }
    };

    const handleBalanceCheck = async () => {
        try {
            // Prepare data for balance check
            const balanceData = {
                reactants: substrates
                    .filter(m => m.verified && (m.formula || m.smiles))
                    .map(m => ({
                        coefficient: parseFloat(m.stoichiometry),
                        formula: m.formula,
                        smiles: m.smiles
                    })),
                products: products
                    .filter(m => m.verified && (m.formula || m.smiles))
                    .map(m => ({
                        coefficient: parseFloat(m.stoichiometry),
                        formula: m.formula,
                        smiles: m.smiles
                    }))
            };

            const response = await api.post('/api/reaction/check-balance/', balanceData);
            
            if (response.data.balanced) {
                setBalanceStatus({
                    balanced: true,
                    message: '✅ Reaction is balanced'
                });
            } else {
                setBalanceStatus({
                    balanced: false,
                    message: '❌ Reaction is not balanced'
                });
            }
        } catch (error) {
            console.error('Error checking balance:', error);
            setBalanceStatus({
                balanced: false,
                message: '❌ Error checking balance. Please try again.'
            });
        }
    };

    const handleEditorOpen = (metabolite: Metabolite) => {
        setEditingMetabolite(metabolite);
        setEditorOpen(true);
    };

    const handleEditorClose = () => {
        setEditorOpen(false);
        setEditingMetabolite(null);
    };

    const handleStructureChange = async (molfile: string) => {
        if (!editingMetabolite) return;

        try {
            const structService = new StandaloneStructServiceProvider();
            const smiles = await structService.convert(molfile, 'smiles');
            
            if (typeof smiles === 'string') {
                const updatedMetabolite = {
                    ...editingMetabolite,
                    smiles,
                    verified: true,
                    warning: ''
                };

                if (editingMetabolite.type === 'reactant') {
                    setSubstrates(substrates.map(r => 
                        r.id === editingMetabolite.id ? updatedMetabolite : r
                    ));
                } else {
                    setProducts(products.map(p => 
                        p.id === editingMetabolite.id ? updatedMetabolite : p
                    ));
                }
            }
        } catch (error) {
            console.error('Error converting structure:', error);
        }
    };

    const renderMetaboliteRow = (metabolite: Metabolite, index: number, type: 'reactant' | 'product') => {
        return (
            <Grow in={true} timeout={300}>
                <Card 
                    sx={{ 
                        mb: 2,
                        ...transitions.card,
                        backgroundColor: metabolite.verified ? 'rgba(46, 125, 50, 0.05)' : 'inherit'
                    }}
                >
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={metabolite.name}
                                    onChange={(e) => handleInputChange(index, 'name', e.target.value, type === 'reactant' ? setSubstrates : setProducts)}
                                    error={!!metabolite.warning}
                                    helperText={metabolite.warning}
                                    sx={transitions.input}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                    fullWidth
                                    label="Coefficient"
                                    type="number"
                                    value={metabolite.coefficient}
                                    onChange={(e) => handleInputChange(index, 'coefficient', e.target.value, type === 'reactant' ? setSubstrates : setProducts)}
                                    sx={transitions.input}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Compartment"
                                    value={metabolite.compartment}
                                    onChange={(e) => handleInputChange(index, 'compartment', e.target.value, type === 'reactant' ? setSubstrates : setProducts)}
                                    sx={transitions.input}
                                >
                                    {compartments.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Type"
                                    value={metabolite.type}
                                    onChange={(e) => handleInputChange(index, 'type', e.target.value, type === 'reactant' ? setSubstrates : setProducts)}
                                    sx={transitions.input}
                                >
                                    {types.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleVerify(index, type === 'reactant' ? setSubstrates : setProducts, type === 'reactant' ? substrates : products)}
                                        sx={transitions.button}
                                    >
                                        Verify
                                    </Button>
                                    <IconButton
                                        onClick={() => handleRemoveRow(index, type === 'reactant' ? setSubstrates : setProducts)}
                                        sx={transitions.icon}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
                        
                        {metabolite.smiles && (
                            <Fade in={true} timeout={500}>
                                <Box sx={{ mt: 2 }}>
                                    <MoleculeViewer smiles={metabolite.smiles} width={300} height={200} />
                                </Box>
                            </Fade>
                        )}
                    </CardContent>
                </Card>
            </Grow>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <AppBar position="static" color="primary" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Create Reaction
                    </Typography>
                </Toolbar>
            </AppBar>

            <Stepper activeStep={0} sx={{ mb: 4 }}>
                <Step>
                    <StepLabel>Define Metabolites</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Balance Reaction</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Review & Submit</StepLabel>
                </Step>
            </Stepper>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ ...transitions.card }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Substrates
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {substrates.map((substrate, index) => renderMetaboliteRow(substrate, index, 'reactant'))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => handleAddRow(setSubstrates)}
                                sx={{ mt: 2, ...transitions.button }}
                            >
                                Add Substrate
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ ...transitions.card }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Products
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {products.map((product, index) => renderMetaboliteRow(product, index, 'product'))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => handleAddRow(setProducts)}
                                sx={{ mt: 2, ...transitions.button }}
                            >
                                Add Product
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBalanceCheck}
                    sx={transitions.button}
                >
                    Check Balance
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSubmit}
                    sx={transitions.button}
                >
                    Submit Reaction
                </Button>
            </Container>

            {balanceStatus && (
                <Zoom in={true}>
                    <Alert 
                        severity={balanceStatus.balanced ? "success" : "error"} 
                        sx={{ mt: 2, ...animations.slideIn }}
                    >
                        {balanceStatus.message}
                    </Alert>
                </Zoom>
            )}

            {error && (
                <Zoom in={true}>
                    <Alert severity="error" sx={{ mt: 2, ...animations.slideIn }}>
                        {error}
                    </Alert>
                </Zoom>
            )}
        </Container>
    );
};

export default CreateReactionPage; 