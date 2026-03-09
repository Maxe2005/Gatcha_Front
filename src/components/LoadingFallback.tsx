import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLoading } from '../context/LoadingContext';

/**
 * Composant de fallback pour Suspense lors du lazy loading des pages
 * Affiche un spinner pendant le chargement du code
 */
const LoadingFallback = ({ message = 'Chargement...' }) => {
  const { setIsLoading } = useLoading();

  useEffect(() => {
    // Active le chargement quand le composant est monté
    setIsLoading(true);

    // Désactive le chargement quand le composant est démonté (page chargée)
    return () => {
      setIsLoading(false);
    };
  }, [setIsLoading]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed', // Position fixe pour se superposer
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'transparent', // Transparent pour voir les particules
        gap: 2,
        zIndex: 10, // Au-dessus du CanvasParticleSystem
        pointerEvents: 'none', // Permet aux clics de passer à travers
      }}
    >
      <CircularProgress size={50} sx={{ pointerEvents: 'auto' }} />
      <Typography
        variant="h6"
        sx={{
          color: 'var(--text-primary)',
          textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6)', // Ombre pour meilleure lisibilité
          fontWeight: 'bold',
          pointerEvents: 'auto',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingFallback;
