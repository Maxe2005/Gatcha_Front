import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Helper to get cookie value
  const getTokenFromCookie = () => {
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    return match ? match[2] : null;
  };

  const [token, setToken] = useState(getTokenFromCookie());
  const [user, setUser] = useState();
  const hasVerified = useRef(false);
  const verificationPromise = useRef(null);

  const login = useCallback((newToken, username) => {
    // Store in cookie FIRST: secure flag should be added in production with https
    document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax`;
    setToken(newToken);
    setUser({ username }); // We might want to decode token or just store username
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    document.cookie = 'token=; path=/; max-age=0';
    setUser(null);
    hasVerified.current = false;
  }, []);

  const verifyToken = useCallback(
    async (tokenToVerify) => {
      if (verificationPromise.current) {
        return verificationPromise.current;
      }

      verificationPromise.current = (async () => {
        try {
          const response = await authApi.post('/user/verify-token', {
            token: tokenToVerify,
          });
          console.log('Token verification response:', response.data);
          if (response.data && response.data.username) {
            setUser({ username: response.data.username });
            return response.data;
          } else {
            logout();
            return null;
          }
        } catch (error) {
          console.error('Token verification failed', error);
          logout();
          return null;
        } finally {
          verificationPromise.current = null;
        }
      })();

      return verificationPromise.current;
    },
    [logout]
  );

  // Vérifier le token au chargement si user est null mais token existe
  useEffect(() => {
    if (token && !user && !hasVerified.current) {
      hasVerified.current = true;
      verifyToken(token);
    }
  }, [token, user, verifyToken]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
