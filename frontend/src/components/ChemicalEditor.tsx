import React, { useState, useEffect } from 'react';
import { Editor } from 'ketcher-react';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import 'ketcher-react/dist/index.css';

interface ChemicalEditorProps {
    open: boolean;
    onClose: () => void;
    onSave: (molfile: string) => void;
    initialMolfile?: string;
}

const ChemicalEditor: React.FC<ChemicalEditorProps> = ({ open, onClose, onSave, initialMolfile }) => {
    const [structServiceProvider] = useState(() => new StandaloneStructServiceProvider());
    const [currentMolfile, setCurrentMolfile] = useState<string>('');
    const [editorInitialized, setEditorInitialized] = useState(false);

    useEffect(() => {
        if (open && initialMolfile && editorInitialized) {
            structServiceProvider.convert(initialMolfile, 'mol')
                .then((molfile) => setCurrentMolfile(molfile))
                .catch(console.error);
        }
    }, [initialMolfile, open, editorInitialized, structServiceProvider]);

    const handleSave = async () => {
        try {
            onSave(currentMolfile);
            onClose();
        } catch (error) {
            console.error('Error saving structure:', error);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{
                sx: { height: '80vh' }
            }}
        >
            <DialogTitle>Chemical Structure Editor</DialogTitle>
            <DialogContent>
                <Box sx={{ height: 'calc(100% - 100px)', width: '100%' }}>
                    <Editor
                        staticResourcesUrl=""
                        structServiceProvider={structServiceProvider}
                        onInit={() => {
                            setEditorInitialized(true);
                            if (initialMolfile) {
                                structServiceProvider.convert(initialMolfile, 'mol')
                                    .then((molfile) => setCurrentMolfile(molfile))
                                    .catch(console.error);
                            }
                        }}
                        onChange={(molfile) => setCurrentMolfile(molfile)}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChemicalEditor; 