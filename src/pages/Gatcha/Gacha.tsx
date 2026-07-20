// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePlayer } from '../../context/PlayerContext';
import { invocationService } from '../../services/invocationService';
import { notifySuccess, notifyError } from '../../services/notificationService';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import GatchaCard from '../../components/GatchaCard/GatchaCard';
import { useNavigate } from 'react-router-dom';
import './Gacha.css';
import type { MonsterData } from '../../types/monster';

const Gacha = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { refreshPlayerData } = usePlayer();
  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleInvoke = async () => {
    setLoading(true);
    setMonster(null);
    try {
      // Le service normalise déjà la réponse (name/rank/element/stats)
      const invokedMonster = await invocationService.invoke(user.username);
      setMonster(invokedMonster);
      notifySuccess('✨ Invocation réussie!');
      // Recharge le joueur pour que le nouveau monstre apparaisse
      // dans l'inventaire sans rechargement de page
      refreshPlayerData();
    } catch (err) {
      notifyError(err);
      setMonster(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className={`gacha-page ${theme === 'dark' ? 'theme-dark' : 'theme-divine'} ${isRevealed ? 'revealed' : 'entering'}`}
      sx={{ flexGrow: 1, minHeight: '100vh', background: 'var(--bg-primary)' }}
    >
      <Box sx={{ p: 2 }}>
        <Button onClick={() => navigate('/home')} variant="outlined">
          ← Retour Home
        </Button>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center', pb: 4 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ color: 'var(--text-primary)', fontFamily: 'Cinzel, serif' }}
        >
          Chambre d&apos;Invocation
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleInvoke}
          disabled={loading}
          sx={{
            mt: 2,
            mb: 4,
            fontSize: '1.2rem',
            py: 2,
            px: 4,
            background: theme === 'dark' ? '#c0392b' : '#ffd700',
            color: theme === 'dark' ? 'white' : 'black',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'INVOQUER'
          )}
        </Button>

        {monster && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <GatchaCard monstre={monster} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Gacha;
