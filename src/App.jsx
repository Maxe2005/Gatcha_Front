import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Home from './pages/Home';
import Gacha from './pages/Gacha';
import Inventory from './pages/Inventory';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MonsterProvider } from './context/MonsterContext';
import { PlayerProvider } from './context/PlayerContext';

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
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/gacha"
        element={
          <PrivateRoute>
            <Gacha />
          </PrivateRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <Inventory />
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
                <AppRoutes />
              </Router>
            </PlayerProvider>
          </MonsterProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
