import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Gacha from './pages/Gacha';
import Inventory from './pages/Inventory';
import GenerateMonsters from './pages/GenerateMonsters';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMonstersList from './pages/admin/AdminMonstersList';
import AdminMonsterDetail from './pages/admin/AdminMonsterDetail';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BackgroundViewProvider } from './context/BackgroundViewContext';
import { MonsterProvider } from './context/MonsterContext';
import { PlayerProvider } from './context/PlayerContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationStack from './components/NotificationStack';

const PrivateRoute = ({ children }) => {
  // const { token } = useAuth();
  // if (!token) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  // const { token, user } = useAuth();
  // if (!token) return <Navigate to="/login" />;
  // if (user?.username !== 'admin') return <Navigate to="/home" />;
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
    <ThemeProvider>
      <BackgroundViewProvider>
        <NotificationProvider>
          <AuthProvider>
            <MonsterProvider>
              <PlayerProvider>
                <Router>
                  <AppRoutes />
                  <NotificationStack />
                </Router>
              </PlayerProvider>
            </MonsterProvider>
          </AuthProvider>
        </NotificationProvider>
      </BackgroundViewProvider>
    </ThemeProvider>
  );
}

export default App;
