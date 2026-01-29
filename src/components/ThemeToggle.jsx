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
            // title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        >
            {theme === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
    );
};

export default ThemeToggle;
