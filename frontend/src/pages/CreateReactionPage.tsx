import * as React from 'react';
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import api from '../services/api';
import { FormulaAutocomplete } from '../components/FormulaAutocomplete';
import { FormulaBuilder } from '../components/FormulaBuilder';
import { Button, TextField, MenuItem, Alert, Paper, Box, IconButton, Container, Typography, Chip, Dialog, DialogTitle, DialogContent, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MoleculeViewer } from '../components/MoleculeViewer';
import OCL from 'openchemlib/full';
import ChemicalEditor from '../components/ChemicalEditor';
import { Edit as EditIcon } from '@mui/icons-material';
import { StandaloneStructServiceProvider } from '../services/StandaloneStructServiceProvider';

interface Formula {
    name: string;
    formula: string;
    source: string;
    noStructure: boolean;
    warnings?: string[];
}

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
        setResponse(null);

        try {
            // 验证所有代谢物是否都有化学式（如果存在）
            const allMetabolites = [...substrates, ...products];
            const invalidMetabolites = allMetabolites.filter(m => 
                m.formula && !m.verified
            );

            if (invalidMetabolites.length > 0) {
                setError(`Invalid chemical formulas found: ${invalidMetabolites.map(m => m.name).join(', ')}`);
                return;
            }

            // 准备提交数据
            const submitData = {
                substrates: substrates.map(({ name, stoichiometry, compartment, type, formula }) => ({
                    name,
                    stoichiometry: parseFloat(stoichiometry),
                    compartment,
                    type,
                    ...(formula && { formula }) // 只在存在化学式时包含该字段
                })),
                products: products.map(({ name, stoichiometry, compartment, type, formula }) => ({
                    name,
                    stoichiometry: parseFloat(stoichiometry),
                    compartment,
                    type,
                    ...(formula && { formula }) // 只在存在化学式时包含该字段
                })),
                direction: '->',
                skipAtomMapping,
                subsystem: 'Default',
                organ: 'Default'
            };

            const response = await api.post('/api/reactions/create/', submitData);
            setResponse(response.data);
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response?.data?.formula_errors) {
                // 处理化学式相关的错误
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
            <Box key={metabolite.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        label="Coefficient"
                        type="number"
                        value={metabolite.coefficient}
                        onChange={(e) => handleInputChange(index, 'coefficient', e.target.value, type === 'reactant' ? setSubstrates : setProducts)}
                        sx={{ width: '100px' }}
                    />
                    <TextField
                        label="Name"
                        value={metabolite.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value, type === 'reactant' ? setSubstrates : setProducts)}
                        sx={{ width: '200px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleVerify(index, type === 'reactant' ? setSubstrates : setProducts, type === 'reactant' ? substrates : products)}
                        sx={{ minWidth: '100px' }}
                    >
                        Verify
                    </Button>
                        <FormulaAutocomplete
                        initialValue={metabolite.formula || ''}
                        value={metabolite.formula || ''}
                        onChange={(newValue) => {
                            handleInputChange(index, 'formula', newValue, type === 'reactant' ? setSubstrates : setProducts);
                        }}
                        apiEndpoint="/api/formula/search"
                        onFormulaSelect={(formula) => {
                            const updatedMetabolite: Metabolite = {
                                ...metabolite,
                                name: formula.name,
                                formula: formula.formula,
                                smiles: formula.smiles,
                                verified: true,
                                formulaSource: (formula.source === 'formula' ? 'calculated' : 'api') as 'calculated' | 'api',
                                noStructure: formula.noStructure ?? false,
                                warnings: formula.warnings ?? [],
                                warning: formula.warnings?.join(', ') || '',
                                stoichiometry: metabolite.stoichiometry,
                                compartment: metabolite.compartment,
                                type: metabolite.type,
                                id: metabolite.id,
                                coefficient: metabolite.coefficient
                            };
                            if (type === 'reactant') {
                                setSubstrates(substrates.map(r => 
                                    r.id === metabolite.id ? updatedMetabolite : r
                                ));
                            } else {
                                setProducts(products.map(p => 
                                    p.id === metabolite.id ? updatedMetabolite : p
                                ));
                            }
                        }}
                        onVerify={async (formula) => {
                            try {
                                const response = await api.post('/api/metabolite/validate/', {
                                    name: formula.name,
                                    type: metabolite.type
                                });
                                
                                if (response.data.verified) {
                                    const updatedMetabolite: Metabolite = {
                                        ...metabolite,
                                        name: formula.name,
                                        formula: formula.formula,
                                        smiles: response.data.structure,
                                        verified: true,
                                        formulaSource: 'api' as const,
                                        noStructure: !response.data.structure,
                                        warnings: response.data.structure ? [] : ['No structure found. Formula used instead.'],
                                        warning: response.data.structure ? '' : 'No structure found. Formula used instead.',
                                        stoichiometry: metabolite.stoichiometry,
                                        compartment: metabolite.compartment,
                                        type: metabolite.type,
                                        id: metabolite.id,
                                        coefficient: metabolite.coefficient
                                    };
                                    
                                    if (type === 'reactant') {
                                        setSubstrates(substrates.map(r => 
                                            r.id === metabolite.id ? updatedMetabolite : r
                                        ));
                                    } else {
                                        setProducts(products.map(p => 
                                            p.id === metabolite.id ? updatedMetabolite : p
                                        ));
                                    }
                                }
                            } catch (error) {
                                console.error('Error verifying metabolite:', error);
                            }
                        }}
                        showWarnings={true}
                        autoComplete={false}
                        sx={{ width: '300px' }}
                    />
                    <IconButton 
                        onClick={() => handleEditorOpen(metabolite)}
                        color="primary"
                        title="Edit structure"
                    >
                        <EditIcon />
                    </IconButton>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemoveRow(index, type === 'reactant' ? setSubstrates : setProducts)}
                    >
                        Remove
                    </Button>
                </Box>
                {metabolite.warning && (
                    <Typography color="warning.main" sx={{ mt: 1 }}>
                        {metabolite.warning}
                    </Typography>
                )}
                {metabolite.smiles && (
                    <Box sx={{ mt: 2 }}>
                        <MoleculeViewer
                            smiles={metabolite.smiles}
                            width={300}
                            height={200}
                        />
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create Metabolic Reaction
            </Typography>
            
            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="h2">
                            Substrates
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddRow(setSubstrates)}
                            sx={{ 
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            Add Substrate
                        </Button>
                    </Box>
                    {substrates.map((metabolite, index) => 
                        renderMetaboliteRow(metabolite, index, 'reactant')
                    )}
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="h2">
                            Products
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddRow(setProducts)}
                            sx={{ 
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            Add Product
                        </Button>
                    </Box>
                    {products.map((metabolite, index) => 
                        renderMetaboliteRow(metabolite, index, 'product')
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ 
                            flex: 1,
                            py: 1.5,
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        Create Reaction
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleBalanceCheck}
                        sx={{ 
                            flex: 1,
                            py: 1.5,
                            bgcolor: 'secondary.main',
                            '&:hover': {
                                bgcolor: 'secondary.dark'
                            }
                        }}
                    >
                        Check Balance
                    </Button>
                </Box>

                {balanceStatus && (
                    <Alert 
                        severity={balanceStatus.balanced ? "success" : "error"} 
                        sx={{ mt: 2 }}
                    >
                        {balanceStatus.message}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 4 }}>
                        {error}
                    </Alert>
                )}

                {response && (
                    <Alert severity="success" sx={{ mt: 4 }}>
                        Reaction created successfully!
                    </Alert>
                )}
            </form>

            <ChemicalEditor
                open={editorOpen}
                onClose={handleEditorClose}
                onSave={handleStructureChange}
                initialMolfile={editingMetabolite?.smiles}
            />
        </Container>
    );
};

export default CreateReactionPage; 