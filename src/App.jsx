import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
