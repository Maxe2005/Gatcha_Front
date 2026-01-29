import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Helper to get cookie value
    const getTokenFromCookie = () => {
        const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
        return match ? match[2] : null;
    };

    const [token, setToken] = useState(getTokenFromCookie());
    const [user, setUser] = useState(null);

    const login = useCallback((newToken, username) => {
        // Store in cookie FIRST: secure flag should be added in production with https
        document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax`; 
        setToken(newToken);
        setUser({ username }); // We might want to decode token or just store username
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        document.cookie = "token=; path=/; max-age=0";
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
