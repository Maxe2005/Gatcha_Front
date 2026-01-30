import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, joueurApi } from '../services/api';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    InputAdornment,
    IconButton,
    Collapse
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleToggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (!username || !password) {
            setError('Tous les champs sont requis.');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        try {
            const endpoint = isLogin ? '/user/login' : '/user';
            const payload = { username, password };

            const response = await authApi.post(endpoint, payload);
            
            if (response.data && response.data.token) {
                login(response.data.token, username);
                if (!isLogin) {
                    try {
                        await joueurApi.post('/api/players', { username });
                    } catch (playerErr) {
                        setError("Compte créé, mais le profil joueur n'a pas pu être initialisé. Réessaie plus tard.");
                        return;
                    }
                }
                navigate('/home', { replace: true });
            } else {
                setError('Login failed: No token received');
            }
        } catch (err) {
            console.error("Login error", err);
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                 setError(isLogin ? 'Identifiants incorrects, voyageur.' : 'Ce pseudo est peut-être déjà pris.');
            } else if (status === 409) {
                setError(isLogin ? 'Conflit de données.' : 'Ce nom d\'utilisateur existe déjà.');
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography component="h1" variant="h5">
                        Gatcha Login
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            className="login-icon-secondary"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Collapse in={!isLogin}>
                            <TextField
                                margin="normal"
                                required={!isLogin}
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirmPassword"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Collapse>
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                    <Box className="login-toggle-container">
                        <Typography variant="body2" className="login-toggle-text">
                            {isLogin ? "Nouveau voyageur ?" : "Déjà un compte ?"}
                            <Button
                                onClick={handleToggleMode}
                                className="login-toggle-btn"
                            >
                                {isLogin ? "Créer un pseudo" : "Connexion"}
                            </Button>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
