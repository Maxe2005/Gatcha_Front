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
import { tokenStorage, SESSION_EXPIRED_EVENT } from '../services/tokenStorage';
import { refreshAccessToken } from '../services/refreshService';
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
  const [token, setToken] = useState(tokenStorage.getAccessToken());
  const [user, setUser] = useState<{
    username: string;
    role: 'USER' | 'ADMIN' | null;
  } | null>(null);
  const hasVerified = useRef(false);
  const verificationPromise = useRef(null);

  const logout = useCallback(() => {
    // Révocation des tokens côté API (fire-and-forget) : la déconnexion
    // locale n'attend pas la réponse et n'échoue jamais
    const currentToken = tokenStorage.getAccessToken();
    const currentRefreshToken = tokenStorage.getRefreshToken();
    if (currentToken) {
      authService.logout(currentToken, currentRefreshToken);
    }
    tokenStorage.clearTokens();
    setToken(null);
    setUser(null);
    hasVerified.current = false;
  }, []);

  const verifyToken = useCallback(
    async (tokenToVerify) => {
      if (verificationPromise.current) {
        return verificationPromise.current;
      }

      const applyUser = (response) => {
        if (response && response.username) {
          setUser({ username: response.username, role: response.role });
          return response;
        }
        return null;
      };

      verificationPromise.current = (async () => {
        try {
          const response = await authService.verifyToken(tokenToVerify);
          const applied = applyUser(response);
          if (!applied) {
            logout();
          }
          return applied;
        } catch {
          // Le token d'accès est peut-être seulement expiré : tenter un
          // rafraîchissement silencieux avant de forcer la déconnexion
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            setToken(newAccessToken);
            try {
              const response = await authService.verifyToken(newAccessToken);
              const applied = applyUser(response);
              if (applied) {
                return applied;
              }
            } catch {
              // Le nouveau token est lui aussi rejeté : déconnexion ci-dessous
            }
          }
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
    (newToken, newRefreshToken, username) => {
      // Store in cookies FIRST: secure flag is added automatically over HTTPS
      tokenStorage.setTokens(newToken, newRefreshToken);
      setToken(newToken);
      // Le login ne renvoie pas le rôle : il reste inconnu (null)
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

  // Déconnexion forcée si un rafraîchissement de token échoue ailleurs dans
  // l'app (ex : intercepteur axios sur un appel API protégé)
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

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
