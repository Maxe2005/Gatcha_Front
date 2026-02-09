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

/**
 * Routes disponibles sur le service Monstres
 */
export const MonstersRoutes = {
  GET_MONSTER: '/api/monsters/:id',
  GET_MONSTERS: '/api/monsters',
  GET_MONSTERS_BY_IDS: '/api/monsters?ids=:ids',
  GET_MONSTER_STATS: '/api/monsters/:id/stats',
  GET_MONSTER_SKILLS: '/api/monsters/:id/skills',
  SEARCH_MONSTERS: '/api/monsters/search',
};

/**
 * Valide les stats d'un monstre
 */
const validateMonsterStats = (stats) => {
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
const normalizeMonsterData = (data) => {
  const errors = [];

  if (!data.id && !data.nom && !data.name) {
    errors.push('Monster must have an ID or name');
  }
  if (data.element && typeof data.element !== 'string') {
    errors.push('Element must be a string');
  }
  if (
    data.rang &&
    typeof data.rang !== 'string' &&
    !['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(data.rang)
  ) {
    errors.push('Invalid rank. Must be COMMON, RARE, EPIC, or LEGENDARY');
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
    nom: data.nom || data.name || 'Unknown',
    element: (data.element || data.type || 'neutre').toLowerCase(),
    rang: data.rang || data.rank || 'COMMON',
    level: data.level || 1,
    experience: data.experience || 0,
    stats: {
      hp: Number(stats.hp || 0),
      atk: Number(stats.atk || 0),
      def: Number(stats.def || 0),
      vit: Number(stats.vit || 0),
    },
    description: data.description || data.lore || data.cardDescription || '',
    skills: Array.isArray(data.skills) ? data.skills : [],
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
  async getMonster(monsterId) {
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
        nom: normalizedData.nom,
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
  async getMonsters(monsterIds) {
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
   * Récupère les stats d'un monstre
   * @param {string|number} monsterId - ID du monstre
   * @returns {Promise<{hp, atk, def, vit}>}
   */
  async getMonsterStats(monsterId) {
    try {
      if (!monsterId) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Monster ID is required',
          400
        );
      }

      logger.debug('MonstersService', 'Fetching monster stats', { monsterId });

      const url = MonstersRoutes.GET_MONSTER_STATS.replace(':id', monsterId);
      const response = await monstersApi.get(url);

      const statsErrors = validateMonsterStats(response.data);
      if (statsErrors.length > 0) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid stats format: ${statsErrors.join(', ')}`,
          200
        );
      }

      const stats = {
        hp: Number(response.data.hp || 0),
        atk: Number(response.data.atk || 0),
        def: Number(response.data.def || 0),
        vit: Number(response.data.vit || 0),
      };

      logger.debug('MonstersService', 'Monster stats fetched', {
        monsterId,
        stats,
      });
      return stats;
    } catch (error) {
      logger.error('MonstersService', 'Failed to fetch monster stats', {
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
   * Récupère les compétences d'un monstre
   * @param {string|number} monsterId - ID du monstre
   * @returns {Promise<Array<SkillData>>}
   */
  async getMonsterSkills(monsterId) {
    try {
      if (!monsterId) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Monster ID is required',
          400
        );
      }

      logger.debug('MonstersService', 'Fetching monster skills', { monsterId });

      const url = MonstersRoutes.GET_MONSTER_SKILLS.replace(':id', monsterId);
      const response = await monstersApi.get(url);

      if (!Array.isArray(response.data)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Invalid response format: expected array of skills',
          200
        );
      }

      const skills = response.data.map((skill) => ({
        name: skill.name || 'Unknown Skill',
        description: skill.description || '',
        damage: Number(skill.damage || 0),
        cooldown: Number(skill.cooldown || 0),
        level: Number(skill.level || 1),
        lvlMax: Number(skill.lvlMax || 1),
        rank: skill.rank || 'COMMON',
      }));

      logger.debug('MonstersService', 'Monster skills fetched', {
        monsterId,
        skillCount: skills.length,
      });
      return skills;
    } catch (error) {
      logger.error('MonstersService', 'Failed to fetch monster skills', {
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
   * Recherche des monstres par critères
   * @param {object} criteria - Critères de recherche {element, rang, minLevel, maxLevel}
   * @returns {Promise<Array<MonsterData>>}
   */
  async searchMonsters(criteria = {}) {
    try {
      const validElements = [
        'fire',
        'water',
        'wind',
        'earth',
        'light',
        'darkness',
        'neutral',
      ];
      const validRanks = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

      if (
        criteria.element &&
        !validElements.includes(criteria.element.toLowerCase())
      ) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid element: ${criteria.element}`,
          400
        );
      }

      if (criteria.rang && !validRanks.includes(criteria.rang.toUpperCase())) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid rank: ${criteria.rang}`,
          400
        );
      }

      logger.debug('MonstersService', 'Searching monsters', { criteria });

      const response = await monstersApi.post(
        MonstersRoutes.SEARCH_MONSTERS,
        criteria
      );

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
      logger.debug('MonstersService', 'Search completed', {
        count: normalizedData.length,
        criteria,
      });

      return normalizedData;
    } catch (error) {
      logger.error('MonstersService', 'Failed to search monsters', {
        criteria,
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },
};
