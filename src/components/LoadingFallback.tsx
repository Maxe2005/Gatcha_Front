import React, { useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import './LoadingFallback.css';

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
    <div className="loading-fallback">
      <div className="loading-fallback-spinner" role="status" aria-label={message} />
      <span className="loading-fallback-message">{message}</span>
    </div>
  );
};

export default LoadingFallback;
