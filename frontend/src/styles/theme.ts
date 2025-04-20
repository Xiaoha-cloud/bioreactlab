import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#4a90e2',
            light: '#6ba8e8',
            dark: '#3572b0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ff6b6b',
            light: '#ff8a8a',
            dark: '#cc5555',
            contrastText: '#ffffff',
        },
        background: {
            default: '#1a1f2c',
            paper: '#2a2f3c',
        },
        text: {
            primary: '#ffffff',
            secondary: '#e0e0e0',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2a2f3c',
                    border: '1px solid #3a3f4c',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2a2f3c',
                    border: '1px solid #3a3f4c',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#1a1f2c',
                        '& fieldset': {
                            borderColor: '#3a3f4c',
                        },
                        '&:hover fieldset': {
                            borderColor: '#4a90e2',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#4a90e2',
                        },
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2a2f3c',
                    borderBottom: '1px solid #3a3f4c',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#2a2f3c',
                    borderRight: '1px solid #3a3f4c',
                },
            },
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 600,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
    },
});

export { theme }; 