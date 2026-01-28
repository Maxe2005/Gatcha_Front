import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import './Login.scss';
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
    CircularProgress,
    IconButton,
    Collapse,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    AutoAwesome as MagicIcon,
    LightMode,
    DarkMode
} from '@mui/icons-material';

const Login = () => {
    // State management
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Error handling
    const [error, setError] = useState('');

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
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
        setIsLoading(true);

        // Basic Validation
        if (!username || !password) {
            setError('Tous les champs sont requis.');
            setIsLoading(false);
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            setIsLoading(false);
            return;
        }

        try {
            const endpoint = isLogin ? '/user/login' : '/user/register';
            const payload = { username, password };

            const response = await authApi.post(endpoint, payload);

            if (isLogin) {
                 if (response.data && response.data.token) {
                    // Ajouter la classe de sortie à la carte de login
                    const loginCard = document.querySelector('.login-card');
                    if (loginCard) {
                        loginCard.classList.add('login-card-exit');
                    }
                    
                    // Déclencher la transition avec particules
                    if (window.triggerParticleTransition) {
                        window.triggerParticleTransition(() => {
                            login(response.data.token, username);
                            navigate('/');
                        });
                    } else {
                        // Fallback si le système de particules n'est pas chargé
                        setTimeout(() => {
                            login(response.data.token, username);
                            navigate('/');
                        }, 800);
                    }
                } else {
                    setError('Erreur de connexion : Aucun jeton reçu.');
                }
            } else {
                // Register flow
                 // If the backend logs in automatically after register
                if (response.data && response.data.token) {
                    // Ajouter la classe de sortie à la carte de login
                    const loginCard = document.querySelector('.login-card');
                    if (loginCard) {
                        loginCard.classList.add('login-card-exit');
                    }
                    
                    // Déclencher la transition avec particules
                    if (window.triggerParticleTransition) {
                        window.triggerParticleTransition(() => {
                            login(response.data.token, username);
                            navigate('/');
                        });
                    } else {
                        // Fallback si le système de particules n'est pas chargé
                        setTimeout(() => {
                            login(response.data.token, username);
                            navigate('/');
                        }, 800);
                    }
                } else {
                    // Otherwise switch to login mode with success message
                    setIsLogin(true);
                    setError('Compte créé ! Connectez-vous maintenant.');
                    setPassword('');
                    setConfirmPassword('');
                }
            }

        } catch (err) {
            console.error("Auth error", err);
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                 setError(isLogin ? 'Identifiants incorrects, voyageur.' : 'Ce pseudo est peut-être déjà pris.');
            } else if (status === 409) {
                setError(isLogin ? 'Conflit de données.' : 'Ce nom d\'utilisateur existe déjà.');
            } else {
                setError('Une erreur mystique est survenue. Réessayez.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box className={`login-container ${theme === 'dark' ? 'theme-dark' : 'theme-divine'}`}>
            {/* Background elements (visual flair) */}
            <Box className="login-bg-glow" />
            
            {/* Particles/Fog Container */}
            <div className={`particles ${theme}-particles`}>
                 {[...Array(50)].map((_, i) => (
                    <div key={i} className="particle"></div>
                ))}
            </div>

            {/* Theme Toggle */}
            <IconButton 
                onClick={toggleTheme} 
                className="theme-toggle-btn"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>

            {/* Main Card */}
            <Box className="login-card">
                {/* Header / Logo */}
                <Box className="login-header">
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        className="login-title"
                    >
                        Gacha Quest
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        className="login-subtitle"
                    >
                        {isLogin ? 'La porte des mondes vous attend.' : 'Commencez à écrire votre légende.'}
                    </Typography>
                </Box>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    
                    {/* Username Field */}
                    <div className="input-wrapper">
                        <TextField
                            fullWidth
                            label="Pseudo"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-input"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon className="login-icon-primary" />
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Votre identifiant unique"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="input-wrapper">
                        <TextField
                            fullWidth
                            label="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon className="login-icon-primary" />
                                    </InputAdornment>
                                ),
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
                    </div>

                    {/* Confirm Password Field (Register Only) */}
                    <Collapse in={!isLogin}>
                        <div className="input-wrapper">
                            <TextField
                                fullWidth
                                label="Confirmer le mot de passe"
                                type="password"
                                variant="outlined"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="login-input"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon className="login-icon-primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                    </Collapse>

                    {/* Error Display */}
                    <Collapse in={!!error}>
                        <Alert 
                            severity="error" 
                            variant="filled"
                            className="login-alert"
                        >
                            {error}
                        </Alert>
                    </Collapse>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading}
                        className="login-button"
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            isLogin ? 'START GAME' : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MagicIcon fontSize="small" />
                                    INVOQUER MON DESTIN
                                </Box>
                            )
                        )}
                    </Button>
                </form>

                {/* Switch Mode Toggle */}
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
            </Box>
        </Box>
    );
};

export default Login;
