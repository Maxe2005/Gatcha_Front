// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService, CredentialRules } from '../../services/authService';
import { joueurService } from '../../services/joueurService';
import './Login.scss';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { usePlayer } from '../../context/PlayerContext';

const PersonIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" />
  </svg>
);

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M2 4.27 3.28 3l18 18-1.27 1.27-3.14-3.14A11.6 11.6 0 0 1 12 20c-5 0-9.27-3.11-11-7 .74-1.67 1.87-3.11 3.26-4.24L2 4.27zM12 8a4 4 0 0 1 4 4c0 .53-.11 1.03-.29 1.49l-1.6-1.6A2 2 0 0 0 12 9.9l-1.6-1.6C10.86 8.11 11.36 8 12 8zm.03-4c5 0 9.27 3.11 11 7-.53 1.19-1.24 2.27-2.09 3.2l-1.42-1.42a9.6 9.6 0 0 0 1.5-1.78c-1.5-2.36-4.32-4.4-8.02-4.4-.9 0-1.75.12-2.55.35L8.85 5.35C9.86 5.03 10.92 4.86 12 4.86z" />
  </svg>
);

const SparkleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zm7 12 .9 2.6L22 17.5l-2.6.9L18.5 21l-.9-2.6L15 17.5l2.6-.9L18.5 14zM5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </svg>
);

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
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { setPlayerData } = usePlayer();

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
      let token, refreshToken, user;

      if (isLogin) {
        // Login flow
        const response = await authService.login(username, password);
        token = response.token;
        refreshToken = response.refreshToken;
        user = response.username;

        if (token) {
          login(token, refreshToken, user);

          // Ajouter la classe de sortie à la carte de login
          const loginCard = document.querySelector('.login-card');
          if (loginCard) {
            loginCard.classList.add('login-card-exit');
          }

          // Déclencher la transition avec particules
          if (window.triggerParticleTransition) {
            window.triggerParticleTransition(() => {
              navigate('/home', { replace: true });
            });
          } else {
            // Fallback si le système de particules n'est pas chargé
            setTimeout(() => {
              navigate('/home', { replace: true });
            }, 800);
          }
        } else {
          setError('Erreur de connexion : Aucun jeton reçu.');
        }
      } else {
        // Register flow
        const response = await authService.register(
          username,
          password,
          confirmPassword
        );
        token = response.token;
        refreshToken = response.refreshToken;
        user = response.username;

        if (token) {
          login(token, refreshToken, user);

          try {
            const dataResponse = await joueurService.createPlayer(username);
            setPlayerData(dataResponse);
          } catch {
            setError(
              "Compte créé, mais le profil joueur n'a pas pu être initialisé. Réessaie plus tard."
            );
            return;
          }

          // Attendre un tick pour que le state soit mis à jour
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Ajouter la classe de sortie à la carte de login
          const loginCard = document.querySelector('.login-card');
          if (loginCard) {
            loginCard.classList.add('login-card-exit');
          }

          // Déclencher la transition avec particules
          if (window.triggerParticleTransition) {
            window.triggerParticleTransition(() => {
              navigate('/home', { replace: true });
            });
          } else {
            // Fallback si le système de particules n'est pas chargé
            setTimeout(() => {
              navigate('/home', { replace: true });
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
      const errorMessage =
        err.message || 'Une erreur mystique est survenue. Réessayez.';

      if (
        errorMessage.includes('401') ||
        errorMessage.includes('403') ||
        errorMessage.includes('Identifiants incorrects')
      ) {
        setError(
          isLogin
            ? 'Identifiants incorrects, voyageur.'
            : 'Ce pseudo est peut-être déjà pris.'
        );
      } else if (
        errorMessage.includes('409') ||
        errorMessage.includes('existe déjà')
      ) {
        setError("Ce nom d'utilisateur existe déjà.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`login-container ${theme === 'dark' ? 'theme-dark' : 'theme-divine'}`}
    >
      {/* Background elements (visual flair) */}
      <div className="login-bg-glow" />

      {/* Particles/Fog Container */}
      <div className={`particles ${theme}-particles`}>
        {[...Array(50)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      {/* Main Card */}
      <div className="login-card">
        {/* Header / Logo */}
        <div className="login-header">
          <h1 className="login-title">Gacha Quest</h1>
          <p className="login-subtitle">
            {isLogin
              ? 'La porte des mondes vous attend.'
              : 'Commencez à écrire votre légende.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="input-wrapper">
            <label htmlFor="login-username" className="login-label">
              Pseudo
            </label>
            <div className="login-input-field">
              <PersonIcon className="login-icon-primary" />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
                placeholder="Votre identifiant unique"
              />
            </div>
            {!isLogin && (
              <span className="login-helper-text">
                {CredentialRules.USERNAME_MIN_LENGTH} à{' '}
                {CredentialRules.USERNAME_MAX_LENGTH} caractères : lettres,
                chiffres, . _ -
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="input-wrapper">
            <label htmlFor="login-password" className="login-label">
              Mot de passe
            </label>
            <div className="login-input-field">
              <LockIcon className="login-icon-primary" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-icon-secondary login-icon-btn"
                aria-label={
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {!isLogin && (
              <span className="login-helper-text">
                {CredentialRules.PASSWORD_MIN_LENGTH} caractères minimum
              </span>
            )}
          </div>

          {/* Confirm Password Field (Register Only) */}
          {!isLogin && (
            <div className="input-wrapper">
              <label htmlFor="login-confirm-password" className="login-label">
                Confirmer le mot de passe
              </label>
              <div className="login-input-field">
                <LockIcon className="login-icon-primary" />
                <input
                  id="login-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="login-input"
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="login-alert" role="alert">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? (
              <span className="login-button-spinner" aria-hidden="true" />
            ) : isLogin ? (
              'START GAME'
            ) : (
              <span className="login-button-content">
                <SparkleIcon />
                INVOQUER MON DESTIN
              </span>
            )}
          </button>
        </form>

        {/* Switch Mode Toggle */}
        <div className="login-toggle-container">
          <span className="login-toggle-text">
            {isLogin ? 'Nouveau voyageur ?' : 'Déjà un compte ?'}
            <button
              type="button"
              onClick={handleToggleMode}
              className="login-toggle-btn"
            >
              {isLogin ? 'Créer un pseudo' : 'Connexion'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
