import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import CanvasParticleSystem from './components/CanvasParticleSystem';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MonsterProvider } from './context/MonsterContext';
import { PlayerProvider } from './context/PlayerContext';

// Lazy load des pages pour Code Splitting
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Gacha = lazy(() => import('./pages/Gacha'));
const Inventory = lazy(() => import('./pages/Inventory'));

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  // if (!token) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<LoadingFallback message="Bienvenue..." />}>
            <Login />
          </Suspense>
        }
      />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Suspense
              fallback={<LoadingFallback message="Accueil en cours..." />}
            >
              <Home />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/gacha"
        element={
          <PrivateRoute>
            <Suspense
              fallback={<LoadingFallback message="Invocation en cours..." />}
            >
              <Gacha />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <Suspense
              fallback={<LoadingFallback message="Inventaire en cours..." />}
            >
              <Inventory />
            </Suspense>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" reverseOrder={false} />
      <ThemeProvider>
        <AuthProvider>
          <MonsterProvider>
            <PlayerProvider>
              <Router>
                <AppContent />
              </Router>
            </PlayerProvider>
          </MonsterProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { theme } = useTheme();

  return (
    <>
      {/* <CanvasParticleSystem theme={theme} /> */}
      <AppRoutes />
    </>
  );
}

export default App;
