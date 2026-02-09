import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Composant de fallback pour Suspense lors du lazy loading des pages
 * Affiche un spinner pendant le chargement du code
 */
const LoadingFallback = ({ message = 'Chargement...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        gap: 2,
      }}
    >
      <CircularProgress size={50} />
      <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingFallback;
