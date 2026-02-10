/**
 * Invocation Service
 * Centralise tous les appels au service d'Invocation (Gacha)
 * Gère les invocations et les appels api
 */

import { invocationApi } from './api';
import { ApiError, ErrorTypes, parseApiError } from './apiClient';
import { logger } from './logger';
import type { MonsterData } from '../types/monster';

/**
 * Routes disponibles sur le service d'Invocation
 */
export const InvocationRoutes = {
  GLOBAL_INVOKE: '/api/invocation/global-invoque/:username',
};

/**
 * Valide les données d'un monstre invoqué
 */
const validateInvokedMonster = (data: any): string[] => {
  const errors = [];

  if (!data.id && !data.nom && !data.name) {
    errors.push('Monster must have an ID or name');
  }
  if (data.ran !== undefined && typeof data.rang !== 'string') {
    errors.push('Rank must be a string');
  }
  if (data.element && typeof data.element !== 'string') {
    errors.push('Element must be a string');
  }

  return errors;
};

/**
 * Normalise les données d'un monstre invoqué
 */
const normalizeInvokedMonster = (data: any): MonsterData => {
  const errors = validateInvokedMonster(data);
  if (errors.length > 0) {
    throw new ApiError(
      ErrorTypes.VALIDATION,
      `Invalid invoked monster data: ${errors.join(', ')}`,
      200
    );
  }

  return {
    id: data.id || data.nom || data.name,
    nom: data.nom || data.name || 'Unknown',
    element: (data.element || data.type || 'neutre').toLowerCase(),
    rang: data.rang || data.rank || 'COMMON',
    level: data.level || 1,
    stats: {
      hp: Number(data.stats?.hp || data.hp || 0),
      atk: Number(data.stats?.atk || data.atk || 0),
      def: Number(data.stats?.def || data.def || 0),
      vit: Number(data.stats?.vit || data.vit || 0),
    },
    description: data.description || data.lore || '',
    skills: Array.isArray(data.skills) ? data.skills : [],
    invokedAt: data.invokedAt || new Date().toISOString(),
  };
};

/**
 * Service d'Invocation
 */
export const invocationService = {
  /**
   * Invoque un monstre (équivalent du Gacha)
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<MonsterData>}
   */
  async invoke(username: string): Promise<MonsterData> {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      logger.debug('InvocationService', 'Invoking monster', { username });

      const url = InvocationRoutes.GLOBAL_INVOKE.replace(':username', username);
      const response = await invocationApi.post(url);

      if (!response.data) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'No monster data returned from invocation',
          200
        );
      }

      const normalizedData = normalizeInvokedMonster(response.data);
      logger.info('InvocationService', 'Monster invoked successfully', {
        username,
        rang: normalizedData.rang,
      });

      return normalizedData;
    } catch (error) {
      logger.error('InvocationService', 'Failed to invoke monster', {
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
