import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ title = 'Gatcha API' }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" className={`header header-${theme}`}>
      <Toolbar className="header-toolbar">
        <Typography variant="h6" className="header-title">
          {title}
        </Typography>
        <Box className="header-actions">
          {user && (
            <Typography variant="subtitle1" className="header-username">
              {user.username}
            </Typography>
          )}
          {user && (
            <Button
              onClick={logout}
              variant="outlined"
              className="header-logout"
            >
              Logout
            </Button>
          )}
          <Box className="header-theme-toggle">
            <ThemeToggle />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
