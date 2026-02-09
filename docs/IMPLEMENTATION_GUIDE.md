# 📝 GUIDE D'IMPLÉMENTATION - Audit Gatcha Frontend

Guide pas-à-pas pour implémenter les recommandations de l'audit.

---

## 🎯 PHASE 1: STABILITÉ (Semaine 1-2)

### ✅ Étape 1.1: Error Boundary Component

**Créer:** `src/components/ErrorBoundary.jsx`

```jsx
import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur
    this.setState((prev) => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // TODO: Envoyer à Sentry ou similaire
    console.error('Error Boundary caught:', error, errorInfo);

    // Éviter la boucle infinie si trop d'erreurs
    if (this.state.errorCount > 5) {
      console.error('Too many errors, reloading page...');
      setTimeout(() => window.location.reload(), 3000);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <h1 className="error-title">😢 Oups!</h1>
            <p className="error-message">
              Quelque chose s'est mal passé. Nous sommes désolés!
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Détails Techniques</summary>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-reset">
                Réessayer
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="btn-home"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Créer:** `src/components/ErrorBoundary.css`

```css
.error-boundary-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-content {
  background: white;
  border-radius: 10px;
  padding: 40px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 2.5rem;
  margin: 0 0 20px 0;
  color: #e74c3c;
}

.error-message {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 30px;
  line-height: 1.6;
}

.error-details {
  background: #f8f9fa;
  border-left: 4px solid #e74c3c;
  padding: 15px;
  margin: 20px 0;
  text-align: left;
  overflow-x: auto;
}

.error-details summary {
  cursor: pointer;
  font-weight: bold;
  color: #e74c3c;
}

.error-details pre {
  font-size: 0.85rem;
  color: #333;
  margin: 10px 0 0 0;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

button {
  padding: 12px 30px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset {
  background: #27ae60;
  color: white;
}

.btn-reset:hover {
  background: #229954;
}

.btn-home {
  background: #3498db;
  color: white;
}

.btn-home:hover {
  background: #2980b9;
}
```

**Utiliser dans App.jsx:**

```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MonsterProvider>
            <PlayerProvider>
              <Router>
                <AppRoutes />
              </Router>
            </PlayerProvider>
          </MonsterProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

---

### ✅ Étape 1.2: Centralized Error Handling

**Créer:** `src/services/apiClient.js`

```javascript
import axios from 'axios';

export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

export class ApiError extends Error {
  constructor(type, message, statusCode = null, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date();
  }
}

export const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Request interceptor
  instance.interceptors.request.use((config) => {
    const match = document.cookie.match(/token=([^;]+)/);
    if (match) {
      config.headers.Authorization = `Bearer ${match[1]}`;
    }
    return config;
  });

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError = parseApiError(error);
      throw apiError;
    }
  );

  return instance;
};

export const parseApiError = (error) => {
  if (!error.response) {
    return new ApiError(
      ErrorTypes.NETWORK,
      'Connexion perdue. Vérifiez votre connexion internet.',
      null,
      error
    );
  }

  const { status, data } = error.response;
  let type, message;

  switch (status) {
    case 400:
      type = ErrorTypes.VALIDATION;
      message = data.message || 'Données invalides';
      break;
    case 401:
      type = ErrorTypes.UNAUTHORIZED;
      message = 'Authentification requise. Veuillez vous reconnecter.';
      break;
    case 403:
      type = ErrorTypes.FORBIDDEN;
      message = "Vous n'avez pas accès à cette ressource";
      break;
    case 404:
      type = ErrorTypes.NOT_FOUND;
      message = 'Ressource non trouvée';
      break;
    case 500:
    case 502:
    case 503:
      type = ErrorTypes.SERVER;
      message = 'Erreur serveur. Réessayez dans quelques instants.';
      break;
    default:
      type = ErrorTypes.UNKNOWN;
      message = data.message || "Une erreur s'est produite";
  }

  return new ApiError(type, message, status, error);
};
```

**Mettre à jour:** `src/services/api.js`

```javascript
import { createApiClient } from './apiClient';

export const monstersApi = createApiClient('/monsters-service');
export const joueurApi = createApiClient('/joueur-service');
export const authApi = createApiClient('/auth-service');
export const invocationApi = createApiClient('/invocation-service');
```

---

### ✅ Étape 1.3: Toast Notification System

**Installer:** `npm install react-hot-toast`

**Créer:** `src/services/notificationService.js`

```javascript
import toast from 'react-hot-toast';
import { ErrorTypes } from './apiClient';

export const notifySuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'bottom-right',
  });
};

export const notifyError = (error, duration = 4000) => {
  let message = error;

  if (error.type === ErrorTypes.NETWORK) {
    message = '❌ Connexion perdue...';
  } else if (error.type === ErrorTypes.UNAUTHORIZED) {
    message = '🔐 Authentification requise';
  } else if (error.type === ErrorTypes.SERVER) {
    message = '⚠️ Erreur serveur, réessayez';
  } else if (error instanceof Error) {
    message = error.message || "Une erreur s'est produite";
  }

  toast.error(message, {
    duration,
    position: 'bottom-right',
  });
};

export const notifyWarning = (message) => {
  toast((t) => <span>⚠️ {message}</span>, {
    duration: 3000,
    position: 'top-center',
  });
};

export const notifyLoading = (message) => {
  return toast.loading(message, {
    position: 'bottom-right',
  });
};

export const updateToast = (toastId, message, type = 'success') => {
  toast.dismiss(toastId);
  toast[type](message, {
    duration: 3000,
    position: 'bottom-right',
  });
};
```

**Utiliser dans App.jsx:**

```jsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <Toaster />
      {/* ... */}
    </ErrorBoundary>
  );
}
```

**Exemple d'utilisation dans une page:**

```jsx
import { notifySuccess, notifyError } from '../services/notificationService';

const handleInvoke = async () => {
  try {
    setLoading(true);
    const response = await invocationApi.get(
      `/api/invocation/global-invoque/${user.username}`
    );
    setMonster(response.data);
    notifySuccess('✨ Invocation réussie!');
  } catch (error) {
    notifyError(error);
  } finally {
    setLoading(false);
  }
};
```

---

### ✅ Étape 1.4: Nettoyer Console.log

**Créer:** `src/services/logger.js`

```javascript
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor() {
    this.level =
      process.env.NODE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG;
  }

  debug(namespace, message, data = {}) {
    if (this.level <= LOG_LEVEL.DEBUG) {
      console.debug(`[${namespace}]`, message, data);
    }
  }

  info(namespace, message, data = {}) {
    if (this.level <= LOG_LEVEL.INFO) {
      console.info(`[${namespace}]`, message, data);
    }
  }

  warn(namespace, message, data = {}) {
    if (this.level <= LOG_LEVEL.WARN) {
      console.warn(`[${namespace}]`, message, data);
    }
  }

  error(namespace, message, data = {}) {
    if (this.level <= LOG_LEVEL.ERROR) {
      console.error(`[${namespace}]`, message, data);
    }
  }
}

export const logger = new Logger();
```

**Utiliser:**

```jsx
// Avant:
console.log('PlayerContext: Loading player data for', user.username);

// Après:
import { logger } from '../services/logger';
logger.info('PlayerContext', 'Loading player data for', {
  username: user.username,
});
```

---

## 🎯 PHASE 2: PERFORMANCE (Semaine 3-5)

### ✅ Étape 2.1: Memoization

**Mettre à jour:** `src/pages/Home.jsx`

```jsx
import { memo, useMemo, useCallback } from 'react';

const Home = memo(() => {
  // ...

  // Memoize le calcul du pourcentage XP
  const xpPercent = useMemo(() => {
    if (!playerData?.experience) return 0;
    return (playerData.experience % 1000) / 10;
  }, [playerData?.experience]);

  // Memoize le handler de portal
  const handlePortalInvoke = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/gacha');
    }, 2050);
  }, [isTransitioning, navigate]);

  // Memoize les ressources
  const resources = useMemo(() => ({
    gold: playerData?.gold || 0,
    gems: playerData?.gems || 0,
    tickets: playerData?.tickets || 0,
  }), [playerData?.gold, playerData?.gems, playerData?.tickets]);

  return (
    // ...
  );
});

export default Home;
```

**Créer:** `src/components/MemoizedGatchaCard.jsx`

```jsx
import { memo } from 'react';
import GatchaCard from './GatchaCard';

const MemoizedGatchaCard = memo(GatchaCard, (prevProps, nextProps) => {
  // Retourner true si props sont identiques (skip render)
  return (
    prevProps.monstre?.id === nextProps.monstre?.id &&
    prevProps.flipOnHover === nextProps.flipOnHover &&
    prevProps.disableClickFlip === nextProps.disableClickFlip
  );
});

export default MemoizedGatchaCard;
```

---

### ✅ Étape 2.2: Canvas Particles

**Créer:** `src/components/CanvasParticleSystem.jsx`

```jsx
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const CanvasParticleSystem = ({ isTransitioning = false }) => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const particlesRef = useRef([]);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = window.devicePixelRatio || 1;

    const handleResize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Spawn particles
    const spawnParticle = () => {
      if (!isTransitioning && particlesRef.current.length < 40) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 50;
        const x = Math.cos(angle) * distance + window.innerWidth / 2;
        const y = Math.sin(angle) * distance + window.innerHeight / 2;

        const isDark = theme === 'dark';
        const particle = {
          x,
          y,
          vx: -Math.cos(angle) * 2,
          vy: -Math.sin(angle) * 2,
          size: Math.random() * 3 + 1,
          life: 1,
          decay: isDark ? 0.02 : 0.015,
          color: isDark
            ? Math.random() > 0.5
              ? '#C0392B'
              : '#641E16'
            : Math.random() > 0.5
              ? '#FFF176'
              : '#FFFFFF',
        };

        particlesRef.current.push(particle);
      }
    };

    const spawnInterval = setInterval(spawnParticle, 150);

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravité
        p.life -= p.decay;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      clearInterval(spawnInterval);
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [theme, isTransitioning]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};

export default CanvasParticleSystem;
```

**Utiliser dans Home.jsx:**

```jsx
import CanvasParticleSystem from '../components/CanvasParticleSystem';

const Home = () => {
  // ... (remover l'ancien système de particules DOM)

  return (
    <div className={`home-container ${theme} ...`}>
      <CanvasParticleSystem isTransitioning={isTransitioning} />
      {/* ... */}
    </div>
  );
};
```

---

### ✅ Étape 2.3: Code Splitting

**Mettre à jour:** `src/App.jsx`

```jsx
import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MonsterProvider } from './context/MonsterContext';
import { PlayerProvider } from './context/PlayerContext';

// Lazy load les pages pour éviter les énormes bundle
const Home = lazy(() => import('./pages/Home'));
const Gacha = lazy(() => import('./pages/Gacha'));
const Inventory = lazy(() => import('./pages/Inventory'));

// Fallback de chargement simple
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
      <p>Chargement...</p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route
        path="/home"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          </Suspense>
        }
      />

      <Route
        path="/gacha"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <PrivateRoute>
              <Gacha />
            </PrivateRoute>
          </Suspense>
        }
      />

      <Route
        path="/inventory"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <PrivateRoute>
              <Inventory />
            </PrivateRoute>
          </Suspense>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MonsterProvider>
          <PlayerProvider>
            <Router>
              <AppRoutes />
            </Router>
          </PlayerProvider>
        </MonsterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

---

### ✅ Étape 2.4: Virtual Scrolling

**Installer:** `npm install react-window`

**Mettre à jour:** `src/pages/Inventory.jsx`

```jsx
import { FixedSizeGrid as Grid } from 'react-window';
import MemoizedGatchaCard from '../components/MemoizedGatchaCard';
import './Inventory.css';

const Cell = ({ columnIndex, rowIndex, style, data }) => {
  const index = rowIndex * data.columns + columnIndex;
  const card = data.cards[index];

  if (!card) {
    return <div style={style} />;
  }

  return (
    <div style={style} className="grid-cell">
      <MemoizedGatchaCard
        monstre={card}
        flipOnHover={true}
        onClick={() => data.onCardClick(card)}
      />
    </div>
  );
};

const Inventory = () => {
  // ... (state management)

  const columns = cardsPerRow;
  const rows = Math.ceil(filteredCards.length / columns);

  return (
    <div className={`inventory-container ${theme}`}>
      {/* ... header et filters ... */}

      {filteredCards.length > 0 ? (
        <div style={{ flex: 1 }}>
          <Grid
            columnCount={columns}
            columnWidth={340}
            height={800}
            rowCount={rows}
            rowHeight={480}
            width={window.innerWidth * 0.9}
            itemData={{
              cards: filteredCards,
              columns,
              onCardClick: handleCardDoubleClick,
            }}
          >
            {Cell}
          </Grid>
        </div>
      ) : (
        <div className="empty-state">Aucun monstre trouvé</div>
      )}
    </div>
  );
};

export default Inventory;
```

---

### ✅ Étape 2.5: Image Optimization

**Installer:** `npm install vite-plugin-image-optimization`

**Mettre à jour:** `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import imageOptimization from 'vite-plugin-image-optimization';

export default defineConfig({
  plugins: [react(), imageOptimization()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animation: ['framer-motion'],
          ui: ['@mui/material', '@emotion/react'],
        },
      },
    },
  },
});
```

---

## 📋 Checklist d'Implémentation

### Phase 1

- [ ] Error Boundary créé et intégré
- [ ] Error Handling centralisé
- [ ] Toast Notifications fonctionnelles
- [ ] Console.log nettoyé

### Phase 2

- [ ] Memoization appliquée
- [ ] Canvas Particles implémenté
- [ ] Code Splitting fonctionnel
- [ ] Virtual Scrolling en place
- [ ] Images optimisées

### Phase 3

- [ ] Tests de base écrits
- [ ] Accessibilité améliorée
- [ ] Mobile responsive testé
- [ ] Logging système en place

### Phase 4

- [ ] SFX intégré (optionnel)
- [ ] Analytics configuré (optionnel)
- [ ] Refinements visuels finalisés

---

## 🚀 Commandes Utiles

```bash
# Démarrer en dev avec profiler
npm run dev

# Build optimisé
npm run build

# Analyser bundle size
npm install -D rollup-plugin-visualizer
# En ajouter dans vite.config.js puis npm run build

# Tests
npm run test

# Lint
npm run lint

# Format
npm run format
```

---

**Fin du guide d'implémentation**
