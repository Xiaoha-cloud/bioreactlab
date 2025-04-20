import React, { useState } from 'react';
import { Grid, Button, Typography, Alert, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

interface Metabolite {
    name: string;
    stoichiometry: number;
    compartment: string;
    type: string;
    charge?: number;
}

interface FormulaBuilderProps {
    onClose: () => void;
    onConfirm: (formula: string) => void;
}

export const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ onClose, onConfirm }) => {
    const [formula, setFormula] = useState('');
    const [error] = useState<string | null>(null);
    const [success] = useState<string | null>(null);
    const [substrates, setSubstrates] = useState<Metabolite[]>([]);
    const [products, setProducts] = useState<Metabolite[]>([]);

    const addMetabolite = (isSubstrate: boolean) => {
        const newMetabolite: Metabolite = {
            name: '',
            stoichiometry: 1,
            compartment: 'c',
            type: 'metabolite'
        };
        if (isSubstrate) {
            setSubstrates([...substrates, newMetabolite]);
        } else {
            setProducts([...products, newMetabolite]);
        }
    };

    const removeMetabolite = (index: number, isSubstrate: boolean) => {
        if (isSubstrate) {
            setSubstrates(substrates.filter((_, i) => i !== index));
        } else {
            setProducts(products.filter((_, i) => i !== index));
        }
    };

    const updateMetabolite = (index: number, field: keyof Metabolite, value: any, isSubstrate: boolean) => {
        const update = (metabolites: Metabolite[]) => {
            const newMetabolites = [...metabolites];
            newMetabolites[index] = { ...newMetabolites[index], [field]: value };
            return newMetabolites;
        };

        if (isSubstrate) {
            setSubstrates(update(substrates));
        } else {
            setProducts(update(products));
        }
    };

    const renderMetaboliteForm = (metabolite: Metabolite, index: number, isSubstrate: boolean) => (
        <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
            <Grid item xs={3}>
                <TextField
                    fullWidth
                    label="Name"
                    value={metabolite.name}
                    onChange={(e) => updateMetabolite(index, 'name', e.target.value, isSubstrate)}
                    size="small"
                />
            </Grid>
            <Grid item xs={2}>
                <TextField
                    fullWidth
                    type="number"
                    label="Stoichiometry"
                    value={metabolite.stoichiometry}
                    onChange={(e) => updateMetabolite(index, 'stoichiometry', parseFloat(e.target.value), isSubstrate)}
                    size="small"
                />
            </Grid>
            <Grid item xs={2}>
                <TextField
                    fullWidth
                    label="Compartment"
                    value={metabolite.compartment}
                    onChange={(e) => updateMetabolite(index, 'compartment', e.target.value, isSubstrate)}
                    size="small"
                />
            </Grid>
            <Grid item xs={2}>
                <TextField
                    fullWidth
                    label="Type"
                    value={metabolite.type}
                    onChange={(e) => updateMetabolite(index, 'type', e.target.value, isSubstrate)}
                    size="small"
                />
            </Grid>
            <Grid item xs={2}>
                <TextField
                    fullWidth
                    type="number"
                    label="Charge"
                    value={metabolite.charge || ''}
                    onChange={(e) => updateMetabolite(index, 'charge', e.target.value ? parseInt(e.target.value) : undefined, isSubstrate)}
                    size="small"
                />
            </Grid>
            <Grid item xs={1}>
                <IconButton onClick={() => removeMetabolite(index, isSubstrate)} color="error" size="small">
                    <RemoveIcon />
                </IconButton>
            </Grid>
        </Grid>
    );

    const renderReactionEquation = () => {
        const formatMetabolite = (m: Metabolite) => {
            const stoichiometry = m.stoichiometry !== 1 ? `${m.stoichiometry} ` : '';
            const charge = m.charge !== undefined ? `[${m.charge}]` : '';
            return `${stoichiometry}${m.name}${charge}(${m.compartment})`;
        };

        const substratesStr = substrates.map(formatMetabolite).join(' + ');
        const productsStr = products.map(formatMetabolite).join(' + ');

        return `${substratesStr} <=> ${productsStr}`;
    };

    const handleConfirm = () => {
        const equation = renderReactionEquation();
        onConfirm(equation);
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Build Chemical Formula</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Typography variant="h6" gutterBottom>Substrates</Typography>
                {substrates.map((m, i) => renderMetaboliteForm(m, i, true))}
                <Button
                    startIcon={<AddIcon />}
                    onClick={() => addMetabolite(true)}
                    sx={{ mt: 1, mb: 3 }}
                    size="small"
                >
                    Add Substrate
                </Button>

                <Typography variant="h6" gutterBottom>Products</Typography>
                {products.map((m, i) => renderMetaboliteForm(m, i, false))}
                <Button
                    startIcon={<AddIcon />}
                    onClick={() => addMetabolite(false)}
                    sx={{ mt: 1, mb: 3 }}
                    size="small"
                >
                    Add Product
                </Button>

                <Typography variant="h6" gutterBottom>Reaction Equation</Typography>
                <Typography variant="body1" sx={{ 
                    fontFamily: 'monospace',
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1
                }}>
                    {renderReactionEquation()}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 