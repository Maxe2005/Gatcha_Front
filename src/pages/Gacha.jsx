import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { invocationService } from '../services/invocationService';
import { notifySuccess, notifyError } from '../services/notificationService';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import GatchaCard from '../components/GatchaCard';
import { useNavigate } from 'react-router-dom';
import './Gacha.css';

const normalizeMonster = (data) => {
  if (!data) return null;

  const parseNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const stats = data.stats || {};

  return {
    nom: data.nom || data.name || 'Monstre Mystère',
    rang: data.rang || data.rank || '?',
    element: (data.element || data.type || 'neutre').toLowerCase(),
    lore:
      data.description ||
      data.lore ||
      data.cardDescription ||
      data.card_description ||
      '',
    stats: {
      hp: parseNumber(stats.hp ?? data.hp),
      atk: parseNumber(stats.atk ?? data.atk),
      def: parseNumber(stats.def ?? data.def),
      vit: parseNumber(stats.vit ?? data.vit),
    },
  };
};

const secondary_monster = {
  nom: 'Abyssal-Hydra',
  element: 'WATER',
  rang: 'EPIC',
  stats: {
    hp: 1500.0,
    atk: 130.0,
    def: 150.0,
    vit: 40.0,
  },
  level: 10.0,
  description:
    "Terreur des fosses marines. Ses trois têtes pensent à l'unisson pour noyer tout espoir.",
  skills: [
    {
      name: 'Morsure Profonde',
      description: 'Les trois têtes mordent en synchronisation.',
      damage: 90.0,
      ratio: {
        stat: 'ATK',
        percent: 1.3,
      },
      cooldown: 0.0,
      level: 1.0,
      lvlMax: 5.0,
      rank: 'COMMON',
    },
    {
      name: 'Lumière Hypnotique',
      description: "Utilise ses lanternes pour étourdir l'adversaire.",
      damage: 50.0,
      ratio: {
        stat: 'DEF',
        percent: 0.6,
      },
      cooldown: 3.0,
      level: 1.0,
      lvlMax: 5.0,
      rank: 'RARE',
    },
    {
      name: 'Régénération Abyssale',
      description: 'Plonge dans un état de transe pour soigner ses blessures.',
      damage: 0.0,
      ratio: {
        stat: 'HP',
        percent: 0.3,
      },
      cooldown: 5.0,
      level: 1.0,
      lvlMax: 5.0,
      rank: 'EPIC',
    },
    {
      name: 'Jugement de la Fosse',
      description: 'Invoque la pression des abysses pour écraser les ennemis.',
      damage: 300.0,
      ratio: {
        stat: 'DEF',
        percent: 2.5,
      },
      cooldown: 6.0,
      level: 1.0,
      lvlMax: 3.0,
      rank: 'LEGENDARY',
    },
  ],
};

const monster_mock = secondary_monster;

const Gacha = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [monster, setMonster] = useState(monster_mock);
  const [loading, setLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const navigate = useNavigate();

  const normalizedMonster = useMemo(() => normalizeMonster(monster), [monster]);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleInvoke = async () => {
    setLoading(true);
    setMonster(null);
    try {
      const invokedMonster = await invocationService.invoke(user.username);
      setMonster(invokedMonster);
      notifySuccess('✨ Invocation réussie!');
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

        {normalizedMonster && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <GatchaCard monstre={normalizedMonster} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Gacha;
