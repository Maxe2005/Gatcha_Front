import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { invocationApi } from '../services/api';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout'; // Note: Must verify if icons are installed. They are in @mui/icons-material.

// I didn't install @mui/icons-material. Let's stick to text or install it.
// I'll install it or just use text "Logout".
// I'll use text for safety.

const Home = () => {
    const { logout, user } = useAuth();
    const [monster, setMonster] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

                {monster && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Card sx={{ maxWidth: 345, width: '100%' }}>
                            {/* If there is an image URL in monster data, use it. Otherwise placeholder */}
                            <CardMedia
                                component="img"
                                height="200"
                                image="https://via.placeholder.com/300?text=Unknown+Monster" // Placeholder
                                alt="Monster"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {monster.name || 'Unknown Monster'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {/* Display other monster stats if available */}
                                    {JSON.stringify(monster, null, 2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Home;
