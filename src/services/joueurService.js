/**
 * Joueur Service
 * Centralise tous les appels au service Joueur (Joueur API)
 * Gère les données joueur, ressources, et progression
 */

import { joueurApi } from './api';
import { ApiError, ErrorTypes, parseApiError } from './apiClient';
import { logger } from './logger';

/**
 * Routes disponibles sur le service Joueur
 */
export const JoueurRoutes = {
  GET_PLAYER: '/api/players/:username',
  UPDATE_PLAYER: '/api/players/:username',
  GET_RESOURCES: '/api/players/:username/resources',
  UPDATE_RESOURCES: '/api/players/:username/resources',
  GET_MONSTERS: '/api/players/:username/monsters',
  ADD_MONSTER: '/api/players/:username/monsters',
  REMOVE_MONSTER: '/api/players/:username/monsters/:monsterId',
  GET_LEVEL: '/api/players/:username/level',
  UPDATE_LEVEL: '/api/players/:username/level',
};

/**
 * Valide les données du joueur en réponse
 */
const validatePlayerData = (data) => {
  const errors = [];

  if (!data.username || typeof data.username !== 'string') {
    errors.push('Invalid username');
  }
  if (data.level && typeof data.level !== 'number') {
    errors.push('Invalid level format');
  }
  if (data.experience && typeof data.experience !== 'number') {
    errors.push('Invalid experience format');
  }

  return errors;
};

/**
 * Normalise les données du joueur
 */
const normalizePlayerData = (data) => {
  const validationErrors = validatePlayerData(data);
  if (validationErrors.length > 0) {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      `Invalid player data: ${validationErrors.join(', ')}`,
      200
    );
  }

  return {
    username: data.username,
    userId: data.id || data.userId,
    level: data.level || 1,
    experience: data.experience || 0,
    gold: data.gold || 0,
    gems: data.gems || 0,
    tickets: data.tickets || 0,
    monsterIds: Array.isArray(data.monsterIds) ? data.monsterIds : [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

/**
 * Service Joueur
 */
export const joueurService = {
  /**
   * Récupère les données complètes du joueur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<PlayerData>}
   */
  async getPlayer(username) {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      logger.debug('JoueurService', 'Fetching player data', { username });

      const url = JoueurRoutes.GET_PLAYER.replace(':username', username);
      const response = await joueurApi.get(url);

      const normalizedData = normalizePlayerData(response.data);
      logger.debug('JoueurService', 'Player data fetched', {
        username,
        level: normalizedData.level,
      });

      return normalizedData;
    } catch (error) {
      logger.error('JoueurService', 'Failed to fetch player', {
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
   * Met à jour les données du joueur
   * @param {string} username - Nom d'utilisateur
   * @param {object} updateData - Données à mettre à jour
   * @returns {Promise<PlayerData>}
   */
  async updatePlayer(username, updateData) {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      if (!updateData || typeof updateData !== 'object') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Update data must be a valid object',
          400
        );
      }

      logger.debug('JoueurService', 'Updating player', {
        username,
        updates: Object.keys(updateData),
      });

      const url = JoueurRoutes.UPDATE_PLAYER.replace(':username', username);
      const response = await joueurApi.patch(url, updateData);

      const normalizedData = normalizePlayerData(response.data);
      logger.info('JoueurService', 'Player updated successfully', { username });

      return normalizedData;
    } catch (error) {
      logger.error('JoueurService', 'Failed to update player', {
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
   * Récupère les ressources du joueur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<{gold, gems, tickets}>}
   */
  async getResources(username) {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      logger.debug('JoueurService', 'Fetching resources', { username });

      const url = JoueurRoutes.GET_RESOURCES.replace(':username', username);
      const response = await joueurApi.get(url);

      const resources = {
        gold: Number(response.data.gold) || 0,
        gems: Number(response.data.gems) || 0,
        tickets: Number(response.data.tickets) || 0,
      };

      // Validation
      Object.values(resources).forEach((val) => {
        if (!Number.isFinite(val) || val < 0) {
          throw new ApiError(
            ErrorTypes.VALIDATION,
            'Invalid resource values in response',
            200
          );
        }
      });

      logger.debug('JoueurService', 'Resources fetched', { resources });
      return resources;
    } catch (error) {
      logger.error('JoueurService', 'Failed to fetch resources', {
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
   * Ajoute une ressource au joueur
   * @param {string} username - Nom d'utilisateur
   * @param {string} resourceType - Type: 'gold', 'gems', 'tickets'
   * @param {number} amount - Quantité à ajouter
   * @returns {Promise<{gold, gems, tickets}>}
   */
  async addResource(username, resourceType, amount) {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      if (!['gold', 'gems', 'tickets'].includes(resourceType)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid resource type: ${resourceType}. Must be 'gold', 'gems', or 'tickets'`,
          400
        );
      }

      if (!Number.isFinite(amount) || amount < 0) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Amount must be a positive number',
          400
        );
      }

      logger.debug('JoueurService', 'Adding resource', {
        username,
        resourceType,
        amount,
      });

      const url = JoueurRoutes.UPDATE_RESOURCES.replace(':username', username);
      const response = await joueurApi.post(url, {
        type: resourceType,
        amount,
      });

      const resources = {
        gold: Number(response.data.gold) || 0,
        gems: Number(response.data.gems) || 0,
        tickets: Number(response.data.tickets) || 0,
      };

      logger.info('JoueurService', 'Resource added', {
        username,
        resourceType,
        amount,
      });
      return resources;
    } catch (error) {
      logger.error('JoueurService', 'Failed to add resource', {
        username,
        resourceType,
        amount,
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Récupère les monstres du joueur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<Array<string>>} - Tableau d'IDs de monstres
   */
  async getMonsters(username) {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      logger.debug('JoueurService', 'Fetching player monsters', { username });

      const url = JoueurRoutes.GET_MONSTERS.replace(':username', username);
      const response = await joueurApi.get(url);

      const monsterIds = Array.isArray(response.data)
        ? response.data
        : response.data.monsterIds || [];

      if (!Array.isArray(monsterIds)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Invalid monster list format',
          200
        );
      }

      logger.debug('JoueurService', 'Monsters fetched', {
        username,
        count: monsterIds.length,
      });
      return monsterIds;
    } catch (error) {
      logger.error('JoueurService', 'Failed to fetch monsters', {
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
   * Ajoute un monstre au joueur
   * @param {string} username - Nom d'utilisateur
   * @param {string|number} monsterId - ID du monstre
   * @returns {Promise<Array<string>>}
   */
  async addMonster(username, monsterId) {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      if (!monsterId) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Monster ID is required',
          400
        );
      }

      logger.debug('JoueurService', 'Adding monster', { username, monsterId });

      const url = JoueurRoutes.ADD_MONSTER.replace(':username', username);
      const response = await joueurApi.post(url, { monsterId });

      const monsterIds = Array.isArray(response.data)
        ? response.data
        : response.data.monsterIds || [];

      logger.info('JoueurService', 'Monster added', { username, monsterId });
      return monsterIds;
    } catch (error) {
      logger.error('JoueurService', 'Failed to add monster', {
        username,
        monsterId,
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },
};
