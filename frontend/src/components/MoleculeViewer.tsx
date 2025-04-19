import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Tooltip, Fade, Grow, Chip } from '@mui/material';
import { animations, transitions } from '../styles/animations';
// @ts-ignore
import OCL from 'openchemlib/full';

// Props interface for MoleculeViewer component
interface MoleculeViewerProps {
    smiles?: string;
    width?: number;
    height?: number;
    title?: string;
    showStatus?: boolean;
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
    smiles,
    width = 200,
    height = 150,
    title,
    showStatus = true
}) => {
    // State management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    // Render molecule when SMILES changes
    useEffect(() => {
        if (!smiles) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setStatus('Rendering molecule...');

        try {
            const mol = OCL.Molecule.fromSmiles(smiles);
            mol.addImplicitHydrogens();
            const svg = mol.toSVG(width, height, 'white');
            setSvgContent(svg);
            setStatus('Molecule rendered successfully');
        } catch (error) {
            console.error('Error rendering molecule:', error);
            setError('Failed to render molecule');
            setStatus('Rendering failed');
        } finally {
            setLoading(false);
        }
    }, [smiles, width, height]);

    if (!smiles) {
        return null;
    }

    return (
        <Grow in={true} timeout={500}>
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 1,
                    ...transitions.card
                }}
            >
                {title && (
                    <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={transitions.container}
                    >
                        {title}
                    </Typography>
                )}
                <Box
                    sx={{
                        position: 'relative',
                        width,
                        height,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'white',
                        ...transitions.container
                    }}
                >
                    {loading && (
                        <Fade in={true}>
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <CircularProgress 
                                    size={24} 
                                    sx={{ 
                                        ...animations.spin,
                                        color: 'primary.main'
                                    }} 
                                />
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                >
                                    Rendering...
                                </Typography>
                            </Box>
                        </Fade>
                    )}
                    {error ? (
                        <Tooltip title={error} arrow>
                            <Box sx={{ 
                                p: 2, 
                                textAlign: 'center',
                                color: 'error.main'
                            }}>
                                <Typography variant="body2">
                                    ⚠️ Failed to render molecule
                                </Typography>
                            </Box>
                        </Tooltip>
                    ) : (
                        <Box
                            component="div"
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                            sx={{
                                opacity: loading ? 0.5 : 1,
                                transition: 'opacity 0.3s ease-in-out'
                            }}
                        />
                    )}
                </Box>
                {showStatus && status && (
                    <Chip
                        label={status}
                        size="small"
                        color={error ? 'error' : 'success'}
                        sx={transitions.chip}
                    />
                )}
            </Paper>
        </Grow>
    );
}; 