import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Gacha from './pages/Gacha';
import Inventory from './pages/Inventory';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PlayerProvider } from './context/PlayerContext';

const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
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
        <ThemeProvider>
            <AuthProvider>
                <PlayerProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </PlayerProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
