/**
 * Auth Service
 * Centralise tous les appels à l'API d'authentification
 * Gère la validation des inputs et normalisation des réponses
 */

import { authApi } from './api';
import { ApiError, ErrorTypes, parseApiError } from './apiClient';
import { logger } from './logger';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Routes disponibles sur le service d'authentification
 */
export const AuthRoutes = {
  LOGIN: '/user/login',
  REGISTER: '/user',
  VERIFY_TOKEN: '/user/verify-token',
  REFRESH_TOKEN: '/user/refresh-token',
  LOGOUT: '/user/logout',
  DELETE: '/user/delete',
  ADMIN_REGISTER: '/user/admin/register',
  ADMIN_DELETE: (username: string) => `/user/admin/delete/${username}`,
};

/**
 * Règles de création de compte — miroir de UserValidator côté API
 * (username 3-32 caractères [a-zA-Z0-9._-], mot de passe >= 8 caractères)
 */
export const CredentialRules = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 32,
  USERNAME_PATTERN: /^[a-zA-Z0-9._-]+$/,
  PASSWORD_MIN_LENGTH: 8,
};

/**
 * Rôles gérés par le service d'authentification
 */
export const Roles = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

/**
 * Valide les credentials de connexion.
 * Volontairement laxiste (non-vide uniquement) : l'API n'impose ses règles
 * de format qu'à la création de compte, et les comptes existants doivent
 * pouvoir continuer à se connecter.
 */
const validateLoginInput = (username: string, password: string) => {
  const errors: string[] = [];

  if (!username || typeof username !== 'string') {
    errors.push("Le nom d'utilisateur est requis");
  }
  if (!password || typeof password !== 'string') {
    errors.push('Le mot de passe est requis');
  }

  return errors;
};

/**
 * Valide username + mot de passe à la création — mêmes règles que l'API
 */
const validateNewCredentials = (username: string, password: string) => {
  const errors: string[] = [];
  const {
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    USERNAME_PATTERN,
    PASSWORD_MIN_LENGTH,
  } = CredentialRules;

  if (!username || typeof username !== 'string' || !username.trim()) {
    errors.push("Le nom d'utilisateur est requis");
  } else {
    if (
      username.length < USERNAME_MIN_LENGTH ||
      username.length > USERNAME_MAX_LENGTH
    ) {
      errors.push(
        `Le nom d'utilisateur doit faire entre ${USERNAME_MIN_LENGTH} et ${USERNAME_MAX_LENGTH} caractères`
      );
    }
    if (!USERNAME_PATTERN.test(username)) {
      errors.push(
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores"
      );
    }
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push('Le mot de passe est requis');
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(
      `Le mot de passe doit faire au moins ${PASSWORD_MIN_LENGTH} caractères`
    );
  }

  return errors;
};

/**
 * Valide les données d'enregistrement
 */
const validateRegisterInput = (
  username: string,
  password: string,
  passwordConfirm: string
) => {
  const errors = validateNewCredentials(username, password);

  if (password !== passwordConfirm) {
    errors.push('Les mots de passe ne correspondent pas');
  }

  return errors;
};

/**
 * Normalise la réponse de login/register
 * L'API renvoie { token, refreshToken } : le username est celui fourni en entrée
 */
const normalizeLoginResponse = (
  data: { token?: string; refreshToken?: string },
  username: string
) => {
  if (!data.token || typeof data.token !== 'string') {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      'Invalid login response: missing or invalid token',
      200
    );
  }
  if (!data.refreshToken || typeof data.refreshToken !== 'string') {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      'Invalid login response: missing or invalid refresh token',
      200
    );
  }

  return {
    token: data.token,
    refreshToken: data.refreshToken,
    username,
  };
};

/**
 * Normalise la réponse de rafraîchissement de token.
 * L'API pivote systématiquement le refresh token (usage unique) :
 * le refreshToken renvoyé remplace obligatoirement l'ancien.
 */
const normalizeRefreshResponse = (data: {
  token?: string;
  refreshToken?: string;
}) => {
  if (!data.token || typeof data.token !== 'string') {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      'Invalid refresh response: missing or invalid token',
      200
    );
  }
  if (!data.refreshToken || typeof data.refreshToken !== 'string') {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      'Invalid refresh response: missing or invalid refresh token',
      200
    );
  }

  return {
    token: data.token,
    refreshToken: data.refreshToken,
  };
};

/**
 * Normalise la réponse de vérification de token
 */
const normalizeVerifyTokenResponse = (data: {
  username?: string;
  role?: string;
}) => {
  if (!data.username) {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      'Invalid token verification response: missing username',
      200
    );
  }

  return {
    username: data.username,
    role: data.role || Roles.USER,
    isValid: true,
  };
};

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<{token, username, userId, expiresIn}>}
   */
  async login(username: string, password: string) {
    try {
      // Validation des inputs
      const validationErrors = validateLoginInput(username, password);
      if (validationErrors.length > 0) {
        logger.warn('AuthService', 'Login validation failed', {
          errors: validationErrors,
        });
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid login inputs: ${validationErrors.join(', ')}`,
          400
        );
      }

      logger.debug('AuthService', 'Attempting login', { username });

      // Le mot de passe est envoyé en clair : le hachage (BCrypt) est
      // désormais géré par le service d'authentification
      const response = await authApi.post(AuthRoutes.LOGIN, {
        username,
        password,
      });

      const normalizedData = normalizeLoginResponse(response.data, username);
      logger.info('AuthService', 'Login successful', { username });

      return normalizedData;
    } catch (error) {
      logger.error('AuthService', 'Login error', {
        username,
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Enregistrement nouvel utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   * @param {string} passwordConfirm - Confirmation mot de passe
   * @returns {Promise<{token, username, userId}>}
   */
  async register(username: string, password: string, passwordConfirm: string) {
    try {
      // Validation des inputs
      const validationErrors = validateRegisterInput(
        username,
        password,
        passwordConfirm
      );
      if (validationErrors.length > 0) {
        logger.warn('AuthService', 'Register validation failed', {
          errors: validationErrors,
        });
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid registration inputs: ${validationErrors.join(', ')}`,
          400
        );
      }

      logger.debug('AuthService', 'Attempting registration', { username });

      // Le mot de passe est envoyé en clair : le hachage (BCrypt) est
      // désormais géré par le service d'authentification
      const response = await authApi.post(AuthRoutes.REGISTER, {
        username,
        password,
      });

      const normalizedData = normalizeLoginResponse(response.data, username);
      logger.info('AuthService', 'Registration successful', { username });

      return normalizedData;
    } catch (error) {
      logger.error('AuthService', 'Registration error', {
        username,
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Vérification du token
   * @param {string} token - Token JWT à vérifier
   * @returns {Promise<{username, userId, isValid}>}
   */
  async verifyToken(token: string) {
    try {
      if (!token || typeof token !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Token must be a non-empty string',
          400
        );
      }

      logger.debug('AuthService', 'Verifying token');

      const response = await authApi.post(AuthRoutes.VERIFY_TOKEN, { token });
      const normalizedData = normalizeVerifyTokenResponse(response.data);

      logger.debug('AuthService', 'Token verified successfully');
      return normalizedData;
    } catch (error) {
      logger.error('AuthService', 'Token verification error', {
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Rafraîchit le token d'accès à partir du refresh token courant.
   * Le refresh token est à usage unique côté API : celui renvoyé dans la
   * réponse remplace obligatoirement l'ancien (rotation systématique).
   * Toute réutilisation d'un refresh token déjà consommé invalide tous les
   * refresh tokens de l'utilisateur côté API (détection de vol) : l'appelant
   * doit alors forcer une reconnexion complète.
   * @param {string} refreshToken - Refresh token courant
   * @returns {Promise<{token, refreshToken}>}
   */
  async refreshToken(refreshToken: string) {
    try {
      if (!refreshToken || typeof refreshToken !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Refresh token must be a non-empty string',
          400
        );
      }

      logger.debug('AuthService', 'Refreshing access token');

      const response = await authApi.post(AuthRoutes.REFRESH_TOKEN, {
        refreshToken,
      });
      const normalizedData = normalizeRefreshResponse(response.data);

      logger.debug('AuthService', 'Access token refreshed successfully');
      return normalizedData;
    } catch (error) {
      logger.warn('AuthService', 'Token refresh failed', {
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Logout utilisateur : révoque le token d'accès et le refresh token
   * côté API (liste de révocation), puis la déconnexion locale (cookies)
   * est faite par AuthContext.
   * Un échec de révocation n'empêche jamais la déconnexion locale.
   * @param {string} token - Token d'accès à révoquer
   * @param {string} [refreshToken] - Refresh token à révoquer, si présent
   * @returns {Promise<{success}>}
   */
  async logout(token: string, refreshToken?: string | null) {
    try {
      if (token) {
        await authApi.post(AuthRoutes.LOGOUT, {
          token,
          refreshToken: refreshToken || undefined,
        });
        logger.info('AuthService', 'Token revoked on logout');
      }
      return { success: true };
    } catch (error) {
      // Token déjà expiré/invalide ou service injoignable : on se
      // déconnecte quand même localement
      logger.warn('AuthService', 'Logout revocation failed', {
        error: getErrorMessage(error),
      });
      return { success: true };
    }
  },

  /**
   * Suppression du compte utilisateur
   * @param {string} token - Token JWT de l'utilisateur à supprimer
   * @returns {Promise<{success}>}
   */
  async deleteAccount(token: string) {
    try {
      if (!token || typeof token !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Token must be a non-empty string',
          400
        );
      }

      logger.debug('AuthService', 'Deleting account');

      await authApi.post(AuthRoutes.DELETE, { token });
      logger.info('AuthService', 'Account deletion successful');

      return { success: true };
    } catch (error) {
      logger.error('AuthService', 'Account deletion error', {
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * [ADMIN] Création d'un utilisateur avec un rôle donné
   * @param {string} token - Token de l'admin appelant
   * @param {string} username - Nom du nouvel utilisateur
   * @param {string} password - Mot de passe du nouvel utilisateur
   * @param {Role} role - Rôle attribué (USER ou ADMIN)
   * @returns {Promise<{token, username}>} - Token du nouvel utilisateur
   */
  async adminRegister(
    token: string,
    username: string,
    password: string,
    role: string = Roles.USER
  ) {
    try {
      const validationErrors = validateNewCredentials(username, password);
      if (validationErrors.length > 0) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid registration inputs: ${validationErrors.join(', ')}`,
          400
        );
      }
      if (!Object.values(Roles).includes(role)) {
        throw new ApiError(ErrorTypes.VALIDATION, `Invalid role: ${role}`, 400);
      }

      logger.debug('AuthService', 'Admin registration', { username, role });

      const response = await authApi.post(AuthRoutes.ADMIN_REGISTER, {
        token,
        username,
        password,
        role,
      });

      const normalizedData = normalizeLoginResponse(response.data, username);
      logger.info('AuthService', 'Admin registration successful', {
        username,
        role,
      });

      return normalizedData;
    } catch (error) {
      logger.error('AuthService', 'Admin registration error', {
        username,
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * [ADMIN] Suppression d'un utilisateur par son username
   * @param {string} token - Token de l'admin appelant
   * @param {string} username - Nom de l'utilisateur à supprimer
   * @returns {Promise<{success}>}
   */
  async adminDeleteUser(token: string, username: string) {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      logger.debug('AuthService', 'Admin user deletion', { username });

      await authApi.post(AuthRoutes.ADMIN_DELETE(username), { token });
      logger.info('AuthService', 'Admin user deletion successful', {
        username,
      });

      return { success: true };
    } catch (error) {
      logger.error('AuthService', 'Admin user deletion error', {
        username,
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },
};
