/**
 * Monsters Service
 * Centralise tous les appels au service Monstres
 * Gère les informations des monstres, leurs stats et compétences
 * Utilise IndexedDB cache pour performance
 */

import { monstersApi } from './api';
import { ApiError, ErrorTypes, parseApiError } from './apiClient';
import { logger } from './logger';
import {
  getMonsterFromCache,
  cacheMonster,
  cacheMonsters,
} from './indexedDBService';
import type { MonsterData, MonsterStats } from '../types/monster';
import type { MonsterSkill } from '../types/skill';
import { Element } from '../enums/elements.enum';
import { Rank } from '../enums/ranks.enum';

type MonsterSearchCriteria = {
  element?: string;
  rang?: string;
  minLevel?: number;
  maxLevel?: number;
};

/**
 * Routes disponibles sur le service Monstres
 */
export const MonstersRoutes = {
  GET_MONSTER: '/api/monsters/get/:id?withSkills=:withSkills',
  GET_MONSTERS_BY_IDS: '/api/monsters/getByIds?ids=:ids',
  GET_BY_PLAYER: '/api/monsters/getByPlayerId/:username',
  DELETE_MONSTER: '/api/monsters/delete/:id',
};

/**
 * Valide les stats d'un monstre
 */
const validateMonsterStats = (stats: any): string[] => {
  const requiredStats = ['hp', 'atk', 'def', 'vit'];
  const errors = [];

  if (!stats || typeof stats !== 'object') {
    errors.push('Stats must be an object');
    return errors;
  }

  requiredStats.forEach((stat) => {
    if (stats[stat] !== undefined && typeof stats[stat] !== 'number') {
      errors.push(`${stat} must be a number`);
    }
    if (stats[stat] && stats[stat] < 0) {
      errors.push(`${stat} cannot be negative`);
    }
  });

  return errors;
};

/**
 * Normalise les données d'un monstre
 */
const normalizeMonsterData = (data: any): MonsterData => {
  const errors = [];

  if (!data.id && !data.nom && !data.name) {
    errors.push('Monster must have an ID or name');
  }
  const validRanks = Object.values(Rank);
  if (
    data.rang &&
    typeof data.rang !== 'string' &&
    !validRanks.includes(data.rang.toUpperCase())
  ) {
    errors.push('Invalid rank. Must be one of: ' + validRanks.join(', '));
  }
  const validElements = Object.values(Element);
  if (
    data.element &&
    typeof data.element === 'string' &&
    !validElements.includes(data.element.toUpperCase())
  ) {
    errors.push('Invalid element. Must be one of: ' + validElements.join(', '));
  }
  if (data.level && typeof data.level !== 'number') {
    errors.push('Level must be a number');
  }
  if (data.experience && typeof data.experience !== 'number') {
    errors.push('Experience must be a number');
  }
  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }
  if (data.skills && !Array.isArray(data.skills)) {
    errors.push('Skills must be an array');
  }
  if (data.imageUrl && typeof data.imageUrl !== 'string') {
    errors.push('Image URL must be a string');
  }

  if (errors.length > 0) {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      `Invalid monster data: ${errors.join(', ')}`,
      200
    );
  }

  const stats = data.stats || {};
  const statsErrors = validateMonsterStats(stats);
  if (statsErrors.length > 0) {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      `Invalid monster stats: ${statsErrors.join(', ')}`,
      200
    );
  }

  return {
    id: data.id || data.nom || data.name,
    name: data.nom || data.name || 'Unknown',
    element: (data.element || data.type || 'neutre').toLowerCase(),
    rank: data.rang || data.rank || 'COMMON',
    level: data.level || 1,
    stats: {
      hp: Number(stats.hp || 0),
      atk: Number(stats.atk || 0),
      def: Number(stats.def || 0),
      vit: Number(stats.vit || 0),
    },
    description: data.description || data.lore || data.cardDescription || '',
    skills: Array.isArray(data.skills) ? data.skills : [],
    imageUrl: data.imageUrl || data.image || '',
  };
};

/**
 * Service Monstres
 */
export const monstersService = {
  /**
   * Récupère un monstre par ID
   * Utilise le cache IndexedDB si disponible
   * @param {string|number} monsterId - ID du monstre
   * @returns {Promise<MonsterData>}
   */
  async getMonster(monsterId: string | number): Promise<MonsterData> {
    try {
      if (!monsterId) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Monster ID is required',
          400
        );
      }

      // Chercher dans le cache d'abord
      const cached = await getMonsterFromCache(String(monsterId));
      if (cached) {
        logger.debug('MonstersService', 'Monster found in cache', {
          monsterId,
        });
        return cached;
      }

      logger.debug('MonstersService', 'Fetching monster', { monsterId });

      const url = MonstersRoutes.GET_MONSTER.replace(':id', monsterId);
      const response = await monstersApi.get(url);

      const normalizedData = normalizeMonsterData(response.data);

      // Ajouter au cache
      await cacheMonster(normalizedData);

      logger.debug('MonstersService', 'Monster fetched', {
        monsterId,
        nom: normalizedData.name,
      });

      return normalizedData;
    } catch (error) {
      logger.error('MonstersService', 'Failed to fetch monster', {
        monsterId,
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Récupère plusieurs monstres par IDs
   * Utilise le cache IndexedDB pour éviter appels API
   * @param {Array<string|number>} monsterIds - Array d'IDs de monstres
   * @returns {Promise<Array<MonsterData>>}
   */
  async getMonsters(
    monsterIds: Array<string | number>
  ): Promise<Array<MonsterData>> {
    try {
      if (!Array.isArray(monsterIds) || monsterIds.length === 0) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Monster IDs must be a non-empty array',
          400
        );
      }

      logger.debug('MonstersService', 'Fetching monsters', {
        count: monsterIds.length,
      });

      // Chercher tous les monstres dans le cache
      const idsToFetch = [];
      const cachedMonsters = [];

      for (const id of monsterIds) {
        const cached = await getMonsterFromCache(String(id));
        if (cached) {
          cachedMonsters.push(cached);
        } else {
          idsToFetch.push(id);
        }
      }

      // Si tous en cache, retourner immédiatement
      if (idsToFetch.length === 0) {
        logger.debug('MonstersService', 'All monsters found in cache');
        // Retourner dans le même ordre que demandé
        return monsterIds.map((id) =>
          cachedMonsters.find((m) => String(m.id) === String(id))
        );
      }

      const idsString = idsToFetch.join(',');
      const url = MonstersRoutes.GET_MONSTERS_BY_IDS.replace(':ids', idsString);
      const response = await monstersApi.get(url);

      if (!Array.isArray(response.data)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Invalid response format: expected array',
          200
        );
      }

      const normalizedData = response.data.map((monsterData) =>
        normalizeMonsterData(monsterData)
      );

      // Ajouter les nouveaux monstres au cache
      await cacheMonsters(normalizedData);

      logger.debug('MonstersService', 'Monsters fetched', {
        count: normalizedData.length,
      });

      // Combiner les monstres cachés + nouveaux dans l'ordre demandé
      const allMonsters = [...cachedMonsters, ...normalizedData];
      return monsterIds.map((id) =>
        allMonsters.find((m) => String(m.id) === String(id))
      );
    } catch (error) {
      logger.error('MonstersService', 'Failed to fetch monsters', {
        count: monsterIds.length,
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Récupère les monstres d'un joueur
   * @param {string} username - Nom d'utilisateur du joueur
   * @returns {Promise<Array<MonsterData>>}
   */
  async getMonstersByPlayer(username: string): Promise<Array<MonsterData>> {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      logger.debug('MonstersService', 'Fetching monsters for player', {
        username,
      });

      const url = MonstersRoutes.GET_BY_PLAYER.replace(':username', username);
      const response = await monstersApi.get(url);

      if (!Array.isArray(response.data)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Invalid response format: expected array',
          200
        );
      }

      const normalizedData = response.data.map((monsterData) =>
        normalizeMonsterData(monsterData)
      );

      logger.debug('MonstersService', 'Monsters for player fetched', {
        username,
        count: normalizedData.length,
      });

      return normalizedData;
    } catch (error) {
      logger.error('MonstersService', 'Failed to fetch monsters for player', {
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
   * Supprime un monstre par ID
   * @param {string|number} monsterId - ID du monstre à supprimer
   * @returns {Promise<void>}
   */
  async deleteMonster(monsterId: string | number): Promise<void> {
    try {
      if (!monsterId) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Monster ID is required',
          400
        );
      }

      logger.debug('MonstersService', 'Deleting monster', { monsterId });

      const url = MonstersRoutes.DELETE_MONSTER.replace(
        ':id',
        String(monsterId)
      );
      await monstersApi.delete(url);

      // Supprimer du cache
      await cacheMonster({
        id: String(monsterId),
        name: '',
        element: '',
        rank: 'COMMON',
        level: 1,
        stats: { hp: 0, atk: 0, def: 0, vit: 0 },
        description: '',
        skills: [],
        imageUrl: '',
      });

      logger.debug('MonstersService', 'Monster deleted', { monsterId });
    } catch (error) {
      logger.error('MonstersService', 'Failed to delete monster', {
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
