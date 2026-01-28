import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { IconButton } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <IconButton
            onClick={toggleTheme}
            className="theme-toggle-btn"
            sx={{
                color: 'var(--primary-color)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'rotate(20deg)',
                    backgroundColor: 'rgba(241, 196, 15, 0.1)',
                },
            }}
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        >
            {theme === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
    );
};

export default ThemeToggle;
