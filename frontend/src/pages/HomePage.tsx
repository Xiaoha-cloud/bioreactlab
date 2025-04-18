import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to BioReactLab
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        A platform for metabolic reaction analysis
      </Typography>
      <Button
        component={Link}
        to="/create-reaction"
        variant="contained"
        color="primary"
        size="large"
      >
        Create New Reaction
      </Button>
    </Box>
  );
};

export default HomePage; 