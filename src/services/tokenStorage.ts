/**
 * Stockage des tokens d'authentification (cookies) + signal de session expirée.
 * Point unique de vérité pour la lecture/écriture des cookies `token` et
 * `refreshToken`, utilisé à la fois par apiClient (intercepteurs axios) et
 * AuthContext (state React) afin d'éviter toute divergence entre les deux.
 */

const ACCESS_TOKEN_COOKIE = 'token';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24; // 24h
// Miroir de AUTH_REFRESH_TOKEN_TTL_DAYS (défaut 30j) côté API_authentification
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

/** Émis quand un rafraîchissement de token échoue : force la déconnexion locale */
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  // Secure ne peut être posé que sur une origine https (sinon le cookie est rejeté)
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
};

const clearCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

export const tokenStorage = {
  getAccessToken: (): string | null => getCookie(ACCESS_TOKEN_COOKIE),
  getRefreshToken: (): string | null => getCookie(REFRESH_TOKEN_COOKIE),

  setTokens: (accessToken: string, refreshToken: string) => {
    setCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_MAX_AGE);
    setCookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_TOKEN_MAX_AGE);
  },

  clearTokens: () => {
    clearCookie(ACCESS_TOKEN_COOKIE);
    clearCookie(REFRESH_TOKEN_COOKIE);
  },

  emitSessionExpired: () => {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  },
};
