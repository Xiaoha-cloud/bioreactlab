import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1a237e', // Deep indigo
            light: '#534bae',
            dark: '#000051',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0d47a1', // Deep blue
            light: '#5472d3',
            dark: '#002171',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
        error: {
            main: '#c62828',
            light: '#ff5f52',
            dark: '#8e0000',
        },
        warning: {
            main: '#f9a825',
            light: '#ffd95a',
            dark: '#c17900',
        },
        success: {
            main: '#2e7d32',
            light: '#60ad5e',
            dark: '#005005',
        },
        info: {
            main: '#1565c0',
            light: '#5e92f3',
            dark: '#003c8f',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 500,
            lineHeight: 1.3,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
            lineHeight: 1.3,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.4,
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
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    borderRadius: 8,
                },
            },
        },
    },
}); 