import React from 'react';
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = ({ title = 'Gatcha API' }) => {
    const { theme } = useTheme();

    return (
        <AppBar
            position="static"
            className={`header header-${theme}`}
            sx={{
                backgroundColor: 'var(--header-bg)',
                boxShadow: '0 2px 8px var(--shadow-color)',
                transition: 'all 0.3s ease',
            }}
        >
            <Toolbar>
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontFamily: 'var(--font-title)',
                        color: 'var(--primary-color)',
                        fontWeight: 'bold',
                    }}
                >
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThemeToggle />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
