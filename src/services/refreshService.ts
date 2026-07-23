/**
 * Rafraîchissement silencieux du token d'accès via le refresh token stocké.
 *
 * Dédoublonne les appels concurrents : le refresh token API est à usage
 * unique (pivoté à chaque appel), donc si deux requêtes échouent en même
 * temps sur un token expiré, elles doivent partager le même appel de
 * rafraîchissement plutôt que de consommer chacune le refresh token et de
 * déclencher la détection de vol côté API (qui révoquerait toute la session).
 */
import { authService } from './authService';
import { tokenStorage } from './tokenStorage';
import { logger } from './logger';

let inFlightRefresh: Promise<string | null> | null = null;

const doRefresh = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const { token, refreshToken: newRefreshToken } =
      await authService.refreshToken(refreshToken);
    tokenStorage.setTokens(token, newRefreshToken);
    return token;
  } catch (error) {
    logger.warn('RefreshService', 'Refresh token invalid or expired', {
      error,
    });
    tokenStorage.clearTokens();
    tokenStorage.emitSessionExpired();
    return null;
  }
};

export const refreshAccessToken = (): Promise<string | null> => {
  if (!inFlightRefresh) {
    inFlightRefresh = doRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
};
