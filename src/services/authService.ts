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
  DELETE: '/user/delete',
  ADMIN_REGISTER: '/user/admin/register',
  ADMIN_DELETE: (username) => `/user/admin/delete/${username}`,
};

/**
 * Rôles gérés par le service d'authentification
 */
export const Roles = {
  USER: 'USER',
  ADMIN: 'ADMIN',
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
 * Normalise la réponse de login/register
 * L'API ne renvoie que { token } : le username est celui fourni en entrée
 */
const normalizeLoginResponse = (data, username) => {
  if (!data.token || typeof data.token !== 'string') {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      'Invalid login response: missing or invalid token',
      200
    );
  }

  return {
    token: data.token,
    username,
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
   * L'API ne propose pas d'endpoint de logout (token opaque à expiration) :
   * la déconnexion est purement locale (suppression du cookie côté front)
   * @returns {Promise<{success}>}
   */
  async logout() {
    logger.info('AuthService', 'Logout (local only)');
    return { success: true };
  },

  /**
   * Suppression du compte utilisateur
   * @param {string} token - Token JWT de l'utilisateur à supprimer
   * @returns {Promise<{success}>}
   */
  async deleteAccount(token) {
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
        error: error.message,
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
  async adminRegister(token, username, password, role = Roles.USER) {
    try {
      const validationErrors = validateLoginInput(username, password);
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
        error: error.message,
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
  async adminDeleteUser(token, username) {
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
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },
};
