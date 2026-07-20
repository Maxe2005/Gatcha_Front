// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { authService } from '../services/authService';
/**
 * AuthContext - Responsabilité unique : AUTHENTIFICATION
 *
 * Gère uniquement :
 * - Le token (stockage cookie + state)
 * - Les informations utilisateur de base (username, role)
 * - Les actions d'authentification (login, logout, verifyToken)
 *
 * NE GÈRE PAS :
 * - Les données métier du joueur (playerData) -> PlayerContext
 * - Les monstres -> MonsterContext
 *
 * Principe SOLID respecté : Single Responsibility Principle (SRP)
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Helper to get cookie value
  const getTokenFromCookie = () => {
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    return match ? match[2] : null;
  };

  const [token, setToken] = useState(getTokenFromCookie());
  const [user, setUser] = useState<{
    username: string;
    role: 'USER' | 'ADMIN' | null;
  } | null>(null);
  const hasVerified = useRef(false);
  const verificationPromise = useRef(null);

  const logout = useCallback(() => {
    // Révocation du token côté API (fire-and-forget) : la déconnexion
    // locale n'attend pas la réponse et n'échoue jamais
    const currentToken = getTokenFromCookie();
    if (currentToken) {
      authService.logout(currentToken);
    }
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
          const response = await authService.verifyToken(tokenToVerify);
          if (response && response.username) {
            setUser({ username: response.username, role: response.role });
            return response;
          } else {
            logout();
            return null;
          }
        } catch {
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

  const login = useCallback(
    (newToken, username) => {
      // Store in cookie FIRST: secure flag should be added in production with https
      document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax`;
      setToken(newToken);
      // Le login ne renvoie que le token : le rôle reste inconnu (null)
      // jusqu'à ce que verify-token le renseigne
      setUser({ username, role: null });
      hasVerified.current = true;
      verifyToken(newToken);
    },
    [verifyToken]
  );

  // Vérifier le token au chargement si user est null mais token existe
  useEffect(() => {
    if (token && !user && !hasVerified.current) {
      hasVerified.current = true;
      verifyToken(token);
    }
  }, [token, user, verifyToken]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{ token, user, isAdmin, login, logout, verifyToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
