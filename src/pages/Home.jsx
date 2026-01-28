import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { invocationApi } from '../services/api';
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import Header from '../components/Header';
import GatchaCard from '../components/GatchaCard';
import './Home.css';

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
        lore: data.description || data.lore || data.cardDescription || data.card_description || '',
        stats: {
            hp: parseNumber(stats.hp ?? data.hp),
            atk: parseNumber(stats.atk ?? data.atk),
            def: parseNumber(stats.def ?? data.def),
            vit: parseNumber(stats.vit ?? data.vit),
        },
    };
};

const first_monster = { "nom": "Pyrolosse",
    "element": "FIRE",
    "rang": "COMMON",
    "stats": { "hp": 450, "atk": 65, "def": 40, "vit": 35 },
    "description": "Un petit bouledogue de lave avec des charbons ardents en guise de fourrure. Ses yeux brillent d'un jaune vif. Style cartoon 2D, contours nets, fond volcanique flou.",
};

const Home = () => {
    const { logout, user } = useAuth();
    const { theme } = useTheme();
    const [monster, setMonster] = useState(first_monster);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const normalizedMonster = useMemo(() => normalizeMonster(monster), [monster]);

    const handleInvoke = async () => {
        setLoading(true);
        setError('');
        setMonster(null);
        try {
            // GET /api/invocation/invoque
            const response = await invocationApi.get('/api/invocation/invoque');
            setMonster(response.data);
        } catch (err) {
            console.error("Invocation error", err);
            setError('Failed to summon monster. ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className={`home-page ${theme === 'dark' ? 'theme-dark' : 'theme-divine'}`} sx={{ flexGrow: 1, minHeight: '100vh' }}>
            <Header title="Gatcha World" />

            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center', pb: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ color: 'var(--primary-color)', fontFamily: 'var(--font-title)' }}>
                    Invoque ton Destin
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
                        background: 'var(--button-gradient)',
                        color: 'white',
                        boxShadow: `0 0 20px ${theme === 'dark' ? 'rgba(146, 43, 33, 0.5)' : 'rgba(241, 196, 15, 0.3)'}`,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                        }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'INVOQUE!'}
                </Button>

                {error && <Typography color="error">{error}</Typography>}

                {normalizedMonster && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <GatchaCard monstre={normalizedMonster} />
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Home;
