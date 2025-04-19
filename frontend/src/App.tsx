import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';
import './styles/global.css';
import './styles/responsive.css';
import HomePage from './pages/HomePage';
import CreateReactionPage from './pages/CreateReactionPage';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/create-reaction" element={<CreateReactionPage />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;
