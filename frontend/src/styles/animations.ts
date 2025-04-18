import { keyframes } from '@mui/material/styles';

// Keyframe animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const slideIn = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const scaleIn = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Animation styles
export const animations = {
    fadeIn: {
        animation: `${fadeIn} 0.3s ease-in-out`,
    },
    slideIn: {
        animation: `${slideIn} 0.3s ease-out`,
    },
    scaleIn: {
        animation: `${scaleIn} 0.2s ease-out`,
    },
    rotate: {
        animation: `${rotate} 1s linear infinite`,
    },
};

// Transition styles
export const transitions = {
    button: {
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-2px)',
        },
    },
    card: {
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        },
    },
    input: {
        transition: 'all 0.2s ease-in-out',
        '&:focus': {
            transform: 'scale(1.02)',
        },
    },
    icon: {
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'scale(1.1)',
        },
    },
}; 