import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Helper to get cookie value
    const getTokenFromCookie = () => {
        const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
        return match ? match[2] : null;
    };

    const [token, setToken] = useState(getTokenFromCookie());
    const [user, setUser] = useState(null);
    const hasVerified = useRef(false);

    const login = (newToken, username) => {
        setToken(newToken);
        // Store in cookie: secure flag should be added in production with https
        document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax`; 
        setUser({ username }); // We might want to decode token or just store username
    };

    const logout = () => {
        setToken(null);
        document.cookie = "token=; path=/; max-age=0";
        setUser(null);
        hasVerified.current = false;
    };

    const verifyToken = useCallback(async (token) => {
        const response = await authApi.post('/user/verify-token', { token })
        console.log('Token verification response:', response.data);
        if (response.data && response.data.username) {
            setUser({ username: response.data.username });
        } else {
            logout();
        }
    }, [logout]);

    // Vérifier le token au chargement si user est null mais token existe
    useEffect(() => {
        if (token && !user && !hasVerified.current) {
            hasVerified.current = true;
            verifyToken(token);
        }
    }, [token, user, verifyToken]);

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
