/**
 * Joueur Service
 * Centralise tous les appels au service Joueur (Joueur API)
 * Gère les données joueur, ressources, et progression
 */

import { joueurApi } from './api';
import { ApiError, ErrorTypes, parseApiError } from './apiClient';
import { logger } from './logger';
import type { PlayerData } from '../types/player';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Routes disponibles sur le service Joueur
 */
export const JoueurRoutes = {
  ADD_PLAYER: '/api/players',
  GET_PLAYER: '/api/players/:username',
  ADD_EXPERIENCE: '/api/players/:username/xp',
  REMOVE_MONSTER: '/api/players/:username/monsters/:monsterId',
};

/**
 * Valide les données du joueur en réponse
 */
/**
 * @param {unknown} data
 * @returns {string[]}
 */
const validatePlayerData = (data: any): string[] => {
  const errors: string[] = [];

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
/**
 * @param {unknown} data
 * @returns {PlayerData}
 */
const normalizePlayerData = (data: any): PlayerData => {
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
  async getPlayer(username: string): Promise<PlayerData> {
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
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Cree un nouveau joueur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<PlayerData>}
   */
  async createPlayer(username: string): Promise<PlayerData> {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      logger.debug('JoueurService', 'Creating player', { username });

      const response = await joueurApi.post(JoueurRoutes.ADD_PLAYER, {
        username,
      });

      const normalizedData = normalizePlayerData(response.data);
      logger.info('JoueurService', 'Player created', { username });
      return normalizedData;
    } catch (error) {
      logger.error('JoueurService', 'Failed to create player', {
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
   * Ajoute de l'expérience au joueur
   * @param {string} username - Nom d'utilisateur
   * @param {number} xp - Quantité d'expérience à ajouter
   * @returns {Promise<PlayerData>}
   */
  async addExperience(username: string, xp: number): Promise<PlayerData> {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }
      if (typeof xp !== 'number' || xp <= 0) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'XP must be a positive number',
          400
        );
      }

      logger.debug('JoueurService', 'Adding experience', { username, xp });

      const url = JoueurRoutes.ADD_EXPERIENCE.replace(':username', username);
      const response = await joueurApi.post(url, { amount: xp });

      const normalizedData = normalizePlayerData(response.data);
      logger.debug('JoueurService', 'Experience added', {
        username,
        newLevel: normalizedData.level,
        newExperience: normalizedData.experience,
      });

      return normalizedData;
    } catch (error) {
      logger.error('JoueurService', 'Failed to add experience', {
        username,
        xp,
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Supprime un monstre du joueur
   * @param {string} username - Nom d'utilisateur
   * @param {string} monsterId - ID du monstre à supprimer
   * @returns {Promise<PlayerData>}
   */
  async removeMonster(username: string, monsterId: string): Promise<PlayerData> {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }
      if (!monsterId || typeof monsterId !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Monster ID must be a non-empty string',
          400
        );
      }

      logger.debug('JoueurService', 'Removing monster', {
        username,
        monsterId,
      });

      const url = JoueurRoutes.REMOVE_MONSTER.replace(':username', username).replace(
        ':monsterId',
        monsterId
      );
      const response = await joueurApi.delete(url);

      const normalizedData = normalizePlayerData(response.data);
      logger.debug('JoueurService', 'Monster removed', {
        username,
        monsterId,
        remainingMonsters: normalizedData.monsterIds.length,
      });

      return normalizedData;
    } catch (error) {
      logger.error('JoueurService', 'Failed to remove monster', {
        username,
        monsterId,
        error: getErrorMessage(error),
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },
};
