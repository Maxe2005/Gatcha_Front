/**
 * Auth Service
 * Centralise tous les appels à l'API d'authentification
 * Gère la validation des inputs et normalisation des réponses
 */

import { authApi } from './api';
import { ApiError, ErrorTypes, parseApiError } from './apiClient';
import { logger } from './logger';

/**
 * Routes disponibles sur le service d'authentification
 */
export const AuthRoutes = {
  LOGIN: '/user/login',
  REGISTER: '/user',
  VERIFY_TOKEN: '/user/verify-token',
  LOGOUT: '/user/logout',
  REFRESH_TOKEN: '/user/refresh-token',
};

/**
 * Valide les credentials de connexion
 */
const validateLoginInput = (username, password) => {
  const errors = [];

  if (!username || typeof username !== 'string') {
    errors.push('Username is required and must be a string');
  }
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required and must be a string');
  }
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return errors;
};

/**
 * Valide les données d'enregistrement
 */
const validateRegisterInput = (username, password, passwordConfirm) => {
  const errors = [];

  if (!username || typeof username !== 'string') {
    errors.push('Username is required and must be a string');
  }
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required and must be a string');
  }
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (password !== passwordConfirm) {
    errors.push('Passwords do not match');
  }

  return errors;
};

/**
 * Normalise la réponse de login
 */
const normalizeLoginResponse = (data) => {
  if (!data.token || typeof data.token !== 'string') {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      'Invalid login response: missing or invalid token',
      200
    );
  }

  return {
    token: data.token,
    username: data.username || data.user || 'Unknown',
    userId: data.userId || data.id,
    expiresIn: data.expiresIn || 86400, // 24h default
  };
};

/**
 * Normalise la réponse de vérification de token
 */
const normalizeVerifyTokenResponse = (data) => {
  if (!data.username) {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      'Invalid token verification response: missing username',
      200
    );
  }

  return {
    username: data.username,
    userId: data.userId || data.id,
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
  async login(username, password) {
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

      const response = await authApi.post(AuthRoutes.LOGIN, {
        username,
        password,
      });

      const normalizedData = normalizeLoginResponse(response.data);
      logger.info('AuthService', 'Login successful', { username });

      return normalizedData;
    } catch (error) {
      logger.error('AuthService', 'Login error', {
        username,
        error: error.message,
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
  async register(username, password, passwordConfirm) {
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

      const response = await authApi.post(AuthRoutes.REGISTER, {
        username,
        password,
      });

      const normalizedData = normalizeLoginResponse(response.data);
      logger.info('AuthService', 'Registration successful', { username });

      return normalizedData;
    } catch (error) {
      logger.error('AuthService', 'Registration error', {
        username,
        error: error.message,
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
  async verifyToken(token) {
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
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Logout utilisateur
   * @returns {Promise<{success}>}
   */
  async logout() {
    try {
      logger.debug('AuthService', 'Logging out');

      await authApi.post(AuthRoutes.LOGOUT, {});
      logger.info('AuthService', 'Logout successful');

      return { success: true };
    } catch (error) {
      logger.error('AuthService', 'Logout error', { error: error.message });
      // Logout échoue mais on considère comme succès localement
      return { success: true };
    }
  },
};
