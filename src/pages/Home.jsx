import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { invocationApi } from '../services/api';
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
    AppBar,
    Toolbar
} from '@mui/material';
import GatchaCard from '../components/GatchaCard';

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
        image: data.image || data.picture || data.sprite || data.illustration || null,
        lore: data.description || data.lore || '',
        stats: {
            hp: parseNumber(stats.hp ?? data.hp),
            atk: parseNumber(stats.atk ?? data.atk),
            def: parseNumber(stats.def ?? data.def),
            vit: parseNumber(stats.vit ?? data.vit),
        },
    };
};

const first_monster = { "nom": "Pyrolosse",
    "element": "Feu",
    "rang": "Commun",
    "stats": { "hp": 450, "atk": 65, "def": 40, "vit": 35 },
    "description": "Un petit bouledogue de lave avec des charbons ardents en guise de fourrure. Ses yeux brillent d'un jaune vif. Style cartoon 2D, contours nets, fond volcanique flou.",
    "image": "Pyrolosse.png"
};

const Home = () => {
    const { logout, user } = useAuth();
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
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Gatcha World
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                        {user?.username}
                    </Typography>
                    <Button color="inherit" onClick={logout}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h3" gutterBottom>
                    Summon Your Destiny
                </Typography>

                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={handleInvoke}
                    disabled={loading}
                    sx={{ mt: 2, mb: 4, fontSize: '1.2rem', py: 2, px: 4 }}
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
