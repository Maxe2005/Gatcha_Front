/**
 * Invocation Service
 * Centralise tous les appels au service d'Invocation (Gacha)
 * Gère les invocations et les appels api
 */

import { invocationApi } from './api';
import { ApiError, ErrorTypes, parseApiError } from './apiClient';
import { logger } from './logger';

/**
 * Routes disponibles sur le service d'Invocation
 */
export const InvocationRoutes = {
  GLOBAL_INVOKE: '/api/invocation/global-invoque/:username',
  SINGLE_INVOKE: '/api/invocation/single-invoke/:username',
  BULK_INVOKE: '/api/invocation/bulk-invoke/:username',
  GET_HISTORY: '/api/invocation/history/:username',
  GET_RATES: '/api/invocation/rates',
  GET_BANNERS: '/api/invocation/banners',
};

/**
 * Valide les données d'un monstre invoqué
 */
const validateInvokedMonster = (data) => {
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
const normalizeInvokedMonster = (data) => {
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
   * @param {object} options - Options d'invocation {element, rarity, etc}
   * @returns {Promise<MonsterData>}
   */
  async invoke(username, options = {}) {
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
      const response = await invocationApi.get(url, { params: options });

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

  /**
   * Invoque un seul monstre avec coût
   * @param {string} username - Nom d'utilisateur
   * @param {string} ticketType - Type de ticket: 'free', 'paid'
   * @returns {Promise<{monster, cost, remaining}>}
   */
  async singleInvoke(username, ticketType = 'free') {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      if (!['free', 'paid'].includes(ticketType)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid ticket type: ${ticketType}. Must be 'free' or 'paid'`,
          400
        );
      }

      logger.debug('InvocationService', 'Single invoking', {
        username,
        ticketType,
      });

      const url = InvocationRoutes.SINGLE_INVOKE.replace(':username', username);
      const response = await invocationApi.post(url, { ticketType });

      if (!response.data.monster) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'No monster data in response',
          200
        );
      }

      const result = {
        monster: normalizeInvokedMonster(response.data.monster),
        cost: Number(response.data.cost || 0),
        remaining: {
          freeTickets: Number(response.data.remaining?.freeTickets || 0),
          paidTickets: Number(response.data.remaining?.paidTickets || 0),
        },
      };

      logger.info('InvocationService', 'Single invocation successful', {
        username,
        rang: result.monster.rang,
      });
      return result;
    } catch (error) {
      logger.error('InvocationService', 'Failed to invoke single monster', {
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
   * Invoque plusieurs monstres en masse
   * @param {string} username - Nom d'utilisateur
   * @param {number} count - Nombre d'invocations (default 10)
   * @param {string} ticketType - Type de ticket
   * @returns {Promise<{monsters, cost, remaining}>}
   */
  async bulkInvoke(username, count = 10, ticketType = 'paid') {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      if (!Number.isInteger(count) || count < 1 || count > 100) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Count must be an integer between 1 and 100',
          400
        );
      }

      if (!['free', 'paid'].includes(ticketType)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          `Invalid ticket type: ${ticketType}. Must be 'free' or 'paid'`,
          400
        );
      }

      logger.debug('InvocationService', 'Bulk invoking', {
        username,
        count,
        ticketType,
      });

      const url = InvocationRoutes.BULK_INVOKE.replace(':username', username);
      const response = await invocationApi.post(url, { count, ticketType });

      if (!Array.isArray(response.data.monsters)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Invalid response format: expected monsters array',
          200
        );
      }

      const result = {
        monsters: response.data.monsters.map((m) => normalizeInvokedMonster(m)),
        cost: Number(response.data.cost || 0),
        remaining: {
          freeTickets: Number(response.data.remaining?.freeTickets || 0),
          paidTickets: Number(response.data.remaining?.paidTickets || 0),
        },
      };

      logger.info('InvocationService', 'Bulk invocation successful', {
        username,
        count,
        monstorsReceived: result.monsters.length,
      });
      return result;
    } catch (error) {
      logger.error('InvocationService', 'Failed to invoke bulk monsters', {
        username,
        count,
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Récupère l'historique des invocations
   * @param {string} username - Nom d'utilisateur
   * @param {object} filters - Filtres {limit, offset, rang}
   * @returns {Promise<Array<InvocationRecord>>}
   */
  async getHistory(username, filters = {}) {
    try {
      if (!username || typeof username !== 'string') {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Username must be a non-empty string',
          400
        );
      }

      if (
        filters.limit &&
        (!Number.isInteger(filters.limit) || filters.limit < 1)
      ) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Limit must be a positive integer',
          400
        );
      }

      logger.debug('InvocationService', 'Fetching invocation history', {
        username,
        filters,
      });

      const url = InvocationRoutes.GET_HISTORY.replace(':username', username);
      const response = await invocationApi.get(url, { params: filters });

      if (!Array.isArray(response.data)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Invalid response format: expected array',
          200
        );
      }

      const history = response.data.map((record) => ({
        id: record.id || record._id,
        monster: record.monster
          ? normalizeInvokedMonster(record.monster)
          : null,
        invokedAt: record.invokedAt || record.createdAt,
        ticketType: record.ticketType || 'unknown',
      }));

      logger.debug('InvocationService', 'Invocation history fetched', {
        username,
        count: history.length,
      });
      return history;
    } catch (error) {
      logger.error('InvocationService', 'Failed to fetch invocation history', {
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
   * Récupère les taux de réussite des invocations
   * @returns {Promise<{rates, pity}>}
   */
  async getRates() {
    try {
      logger.debug('InvocationService', 'Fetching invocation rates');

      const response = await invocationApi.get(InvocationRoutes.GET_RATES);

      if (!response.data) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'No rates data returned',
          200
        );
      }

      const rates = {
        common: Number(response.data.common || 0.7),
        rare: Number(response.data.rare || 0.2),
        epic: Number(response.data.epic || 0.08),
        legendary: Number(response.data.legendary || 0.02),
        pity: {
          soft: Number(response.data.pity?.soft || 99),
          hard: Number(response.data.pity?.hard || 180),
        },
      };

      logger.debug('InvocationService', 'Invocation rates fetched', { rates });
      return rates;
    } catch (error) {
      logger.error('InvocationService', 'Failed to fetch rates', {
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },

  /**
   * Récupère les bannières actives
   * @returns {Promise<Array<Banner>>}
   */
  async getBanners() {
    try {
      logger.debug('InvocationService', 'Fetching invocation banners');

      const response = await invocationApi.get(InvocationRoutes.GET_BANNERS);

      if (!Array.isArray(response.data)) {
        throw new ApiError(
          ErrorTypes.VALIDATION,
          'Invalid response format: expected banners array',
          200
        );
      }

      const banners = response.data.map((banner) => ({
        id: banner.id || banner._id,
        name: banner.name || 'Unknown Banner',
        description: banner.description || '',
        active: banner.active !== false,
        featuredMonster: banner.featuredMonster,
        startDate: banner.startDate,
        endDate: banner.endDate,
        rates: banner.rates || {},
      }));

      logger.debug('InvocationService', 'Invocation banners fetched', {
        count: banners.length,
      });
      return banners;
    } catch (error) {
      logger.error('InvocationService', 'Failed to fetch banners', {
        error: error.message,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw parseApiError(error);
    }
  },
};
