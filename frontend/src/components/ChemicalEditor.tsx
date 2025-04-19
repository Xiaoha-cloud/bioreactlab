import React, { useState, useEffect } from 'react';
import { Editor } from 'ketcher-react';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Box,
    CircularProgress,
    Alert,
    Snackbar,
    Fade,
    Grow,
    Zoom,
    Typography,
    Paper
} from '@mui/material';
import { animations, transitions } from '../styles/animations';
import 'ketcher-react/dist/index.css';

// Props interface for ChemicalEditor component
interface ChemicalEditorProps {
    open: boolean;
    onClose: () => void;
    onSave: (molfile: string) => void;
    initialMolfile?: string;
}

const ChemicalEditor: React.FC<ChemicalEditorProps> = ({ open, onClose, onSave, initialMolfile }) => {
    // State management
    const [structServiceProvider] = useState(() => new StandaloneStructServiceProvider());
    const [currentMolfile, setCurrentMolfile] = useState<string>('');
    const [editorInitialized, setEditorInitialized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load initial structure when editor opens
    useEffect(() => {
        if (open && initialMolfile && editorInitialized) {
            setLoading(true);
            structServiceProvider.convert(initialMolfile, 'mol')
                .then((molfile) => {
                    setCurrentMolfile(molfile);
                    setLoading(false);
                    setSuccess('Structure loaded successfully');
                })
                .catch((error) => {
                    console.error('Error loading initial structure:', error);
                    setError('Failed to load initial structure');
                    setLoading(false);
                });
        }
    }, [initialMolfile, open, editorInitialized, structServiceProvider]);

    // Handle save operation
    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await onSave(currentMolfile);
            setSuccess('Structure saved successfully');
            setTimeout(() => {
                onClose();
                setSuccess(null);
            }, 1000);
        } catch (error) {
            console.error('Error saving structure:', error);
            setError('Failed to save structure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose} 
                maxWidth="lg" 
                fullWidth
                PaperProps={{
                    sx: {
                        ...transitions.paper,
                        height: '80vh',
                        '&:hover': {
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        },
                    }
                }}
            >
                <DialogTitle sx={{ 
                    ...transitions.container,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}>
                    Chemical Structure Editor
                </DialogTitle>
                <DialogContent sx={{ 
                    position: 'relative',
                    height: 'calc(100% - 100px)',
                    overflow: 'hidden'
                }}>
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
                                gap: 2
                            }}>
                                <CircularProgress 
                                    size={40} 
                                    sx={{ 
                                        ...animations.spin,
                                        color: 'primary.main'
                                    }} 
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Loading editor...
                                </Typography>
                            </Box>
                        </Fade>
                    )}
                    <Box sx={{ 
                        height: '100%', 
                        width: '100%',
                        opacity: loading ? 0.5 : 1,
                        transition: 'opacity 0.3s ease-in-out'
                    }}>
                        <Editor
                            staticResourcesUrl=""
                            structServiceProvider={structServiceProvider}
                            onInit={() => {
                                setEditorInitialized(true);
                                if (initialMolfile) {
                                    setLoading(true);
                                    structServiceProvider.convert(initialMolfile, 'mol')
                                        .then((molfile) => {
                                            setCurrentMolfile(molfile);
                                            setLoading(false);
                                            setSuccess('Editor initialized successfully');
                                        })
                                        .catch((error) => {
                                            console.error('Error loading initial structure:', error);
                                            setError('Failed to load initial structure');
                                            setLoading(false);
                                        });
                                }
                            }}
                            onChange={(molfile) => setCurrentMolfile(molfile)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    p: 2
                }}>
                    <Button 
                        onClick={onClose}
                        sx={transitions.button}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                        sx={transitions.button}
                    >
                        {loading ? (
                            <CircularProgress 
                                size={20} 
                                sx={{ 
                                    ...animations.spin,
                                    color: 'inherit'
                                }} 
                            />
                        ) : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

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
        </>
    );
};

export default ChemicalEditor; 