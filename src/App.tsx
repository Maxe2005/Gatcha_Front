import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import CanvasParticleSystem from './components/CanvasParticleSystem';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MonsterProvider } from './context/MonsterContext';
import { PlayerProvider } from './context/PlayerContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import GenerateMonsters from './pages/admin/GenerateMonsters/GenerateMonsters';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import AdminMonstersList from './pages/admin/AdminMonstersList/AdminMonstersList';
import AdminMonsterDetail from './pages/admin/AdminMonsterDetail/AdminMonsterDetail';
import { NotificationProvider } from './context/NotificationContext';
import NotificationStack from './components/NotificationStack/NotificationStack';
import { BackgroundViewProvider } from './context/BackgroundViewContext';

// // Fonction pour simuler un délai de chargement (pour le développement)
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// // Lazy load des pages pour Code Splitting avec délai simulé de 5s
// const Login = lazy(() => delay(5000).then(() => import('./pages/Login')));
// const Home = lazy(() => delay(5000).then(() => import('./pages/Home')));
// const Gacha = lazy(() => delay(5000).then(() => import('./pages/Gacha')));
// const Inventory = lazy(() =>
//   delay(5000).then(() => import('./pages/Inventory'));

const Login = lazy(() => import('./pages/Login/Login'));
const Home = lazy(() => import('./pages/Home/Home'));
const Gacha = lazy(() => import('./pages/Gatcha/Gacha'));
const Inventory = lazy(() => import('./pages/Inventory/Inventory'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Infos = lazy(() => import('./pages/Infos/Infos'));

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  // Token présent mais verify-token pas encore résolu : on attend le rôle
  if (!user?.role)
    return <LoadingFallback message="Vérification des accès..." />;
  if (user.role !== 'ADMIN') return <Navigate to="/home" />;
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
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Suspense
              fallback={<LoadingFallback message="Profil en cours..." />}
            >
              <Profile />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/infos"
        element={
          <PrivateRoute>
            <Suspense
              fallback={<LoadingFallback message="Infos en cours..." />}
            >
              <Infos />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/monsters"
        element={
          <AdminRoute>
            <AdminMonstersList />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/monsters/:monsterId"
        element={
          <AdminRoute>
            <AdminMonsterDetail />
          </AdminRoute>
        }
      />
      <Route
        path="/generate"
        element={
          <AdminRoute>
            <GenerateMonsters />
          </AdminRoute>
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
        <LoadingProvider>
          <BackgroundViewProvider>
            <NotificationProvider>
              <AuthProvider>
                <MonsterProvider>
                  <PlayerProvider>
                    <Router>
                      <AppContent />
                      <NotificationStack />
                    </Router>
                  </PlayerProvider>
                </MonsterProvider>
              </AuthProvider>
            </NotificationProvider>
          </BackgroundViewProvider>
        </LoadingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const { isLoading } = useLoading();

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        >
          <CanvasParticleSystem theme={theme} />
        </div>
      )}
      <AppRoutes />
    </>
  );
}

export default App;
