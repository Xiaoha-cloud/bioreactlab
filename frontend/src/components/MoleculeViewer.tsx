import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
// @ts-ignore
import OCL from 'openchemlib/full';

interface MoleculeViewerProps {
    smiles?: string;
    width?: number;
    height?: number;
    title?: string;
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
    smiles,
    width = 200,
    height = 150,
    title
}) => {
    const renderStructure = () => {
        if (!smiles) {
            return { __html: '<div>No SMILES provided</div>' };
        }

        try {
            const mol = OCL.Molecule.fromSmiles(smiles);
            mol.addImplicitHydrogens(); // 添加隐式氢原子
            const svg = mol.toSVG(width, height, 'white');
            return { __html: svg };
        } catch (error) {
            console.error('Error rendering molecule:', error);
            return { __html: '<div>⚠️ Failed to render molecule</div>' };
        }
    };

    if (!smiles) {
        return null;
    }

    return (
        <Paper 
            elevation={1} 
            sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 1
            }}
        >
            {title && (
                <Typography variant="subtitle2" color="text.secondary">
                    {title}
                </Typography>
            )}
            <Box
                sx={{
                    width,
                    height,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'white'
                }}
                dangerouslySetInnerHTML={renderStructure()}
            />
        </Paper>
    );
}; 