import { adminApi, generationApi } from './api';

const MONSTER_STATS_CACHE_KEY = 'monster-stats-by-state-v1';
const monsterStatsByStateCache = new Map();
const monsterStatsByStateInFlight = new Map();

const normalizeState = (state?: string) =>
  String(state || 'PENDING_REVIEW').toUpperCase();

const loadMonsterStatsSessionCache = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const raw = window.sessionStorage.getItem(MONSTER_STATS_CACHE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([state, value]) => {
      monsterStatsByStateCache.set(state, value);
    });
  } catch {
    window.sessionStorage.removeItem(MONSTER_STATS_CACHE_KEY);
  }
};

const persistMonsterStatsSessionCache = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const snapshot = Object.fromEntries(monsterStatsByStateCache.entries());
  window.sessionStorage.setItem(
    MONSTER_STATS_CACHE_KEY,
    JSON.stringify(snapshot)
  );
};

loadMonsterStatsSessionCache();

/**
 * Admin API Service - handles all admin-related API calls
 */

export const adminApiService = {
  // Dashboard endpoints
  getDashboardStats: async () => {
    const response = await adminApi.get('/dashboard/stats');
    return response.data;
  },

  // Monster endpoints
  getMonsters: async (params = {}) => {
    const response = await adminApi.get('/monsters', { params });
    return response.data;
  },

  getMonsterDetail: async (monsterId: string | number) => {
    const response = await adminApi.get(`/monsters/${monsterId}`);
    return response.data;
  },

  getMonsterHistory: async (monsterId: string | number) => {
    const response = await adminApi.get(`/monsters/${monsterId}/history`);
    const data = response.data;
    // Nouvelle forme d'API : { monster_id, current_state, timeline: [...] }
    // Pour garder la compatibilité avec le code existant, normaliser
    // la réponse pour retourner `{ history: [...] }` lorsque `timeline` existe.
    if (data && Array.isArray(data.timeline)) {
      return {
        monster_id: data.monster_id,
        current_state: data.current_state,
        history: data.timeline,
      };
    }

    return data;
  },

  reviewMonster: async (
    monsterId: string | number,
    username = 'Admin',
    notes: string | null = null
  ) => {
    const payload = {
      admin_name: username,
      notes,
    };
    const response = await adminApi.post(
      `/monsters/${monsterId}/review`,
      payload
    );
    return response.data;
  },

  correctMonster: async (
    monsterId: string | number,
    username = 'Admin',
    notes: string | null = null
  ) => {
    const payload = {
      admin_name: username,
      notes,
    };
    const response = await adminApi.post(
      `/monsters/${monsterId}/correct`,
      payload
    );
    return response.data;
  },

  updateMonster: async (
    monsterId: string | number,
    username = 'Admin',
    monsterData: unknown,
    options: { skipValidation?: boolean; notes?: string } = {}
  ) => {
    const payload = {
      monster_data: monsterData,
      skip_validation: Boolean(options.skipValidation),
      notes: options.notes || null,
      admin_name: username,
    };
    const response = await adminApi.post(
      `/monsters/${monsterId}/update`,
      payload
    );
    return response.data;
  },

  rejectMonster: async (
    monsterId: string | number,
    username = 'Admin',
    notes: string | null = null
  ) => {
    const payload = {
      admin_name: username,
      notes,
    };
    const response = await adminApi.post(
      `/monsters/${monsterId}/reject`,
      payload
    );
    return response.data;
  },

  // Validation rules endpoint
  getValidationRules: async () => {
    const response = await adminApi.get('/validation-rules');
    return response.data;
  },

  // Global monster stats for cards by workflow state
  getMonsterStatsByState: async (state = 'PENDING_REVIEW', options: { forceRefresh?: boolean } = {}) => {
    const normalizedState = normalizeState(state);
    const forceRefresh = Boolean(options.forceRefresh);

    if (!forceRefresh && monsterStatsByStateCache.has(normalizedState)) {
      return monsterStatsByStateCache.get(normalizedState);
    }

    if (!forceRefresh && monsterStatsByStateInFlight.has(normalizedState)) {
      return monsterStatsByStateInFlight.get(normalizedState);
    }

    const requestPromise = adminApi
      .get('/stats/monsters', {
        params: { state: normalizedState },
      })
      .then((response) => {
        const payload = response.data;
        monsterStatsByStateCache.set(normalizedState, payload);
        persistMonsterStatsSessionCache();
        return payload;
      })
      .finally(() => {
        monsterStatsByStateInFlight.delete(normalizedState);
      });

    monsterStatsByStateInFlight.set(normalizedState, requestPromise);
    return requestPromise;
  },

  // Process a single generated monster
  processGeneratedMonster: async (monsterId: string | number) => {
    const response = await adminApi.post(
      `/monsters/${monsterId}/process-generated`
    );
    return response.data;
  },
  // Process generated monsters (batch)
  processGeneratedMonsters: async () => {
    const response = await adminApi.post('/monsters/process-generated');
    return response.data;
  },

  // Transmit a single approved monster to invocation API
  transmitMonster: async (monsterId: string | number, force = false) => {
    const response = await generationApi.post(
      `/transmission/transmit/${monsterId}`,
      null,
      {
        params: { force },
      }
    );
    return response.data;
  },

  // Transmit approved monsters in batch
  transmitMonstersBatch: async (maxCount = 50) => {
    const response = await generationApi.post(
      '/transmission/transmit-batch',
      null,
      {
        params: { max_count: maxCount },
      }
    );
    return response.data;
  },

  // Monster images endpoints
  getMonsterImages: async (monsterId: string | number) => {
    const response = await generationApi.get(`/monsters/images/${monsterId}`);
    return response.data;
  },

  setMonsterDefaultImage: async (monsterId: string | number, imageId: string | number) => {
    const payload = { image_id: imageId };
    const response = await generationApi.put(
      `/monsters/images/${monsterId}/default`,
      payload
    );
    return response.data;
  },

  renameMonsterImage: async (
    monsterId: string | number,
    imageId: string | number,
    newName: string
  ) => {
    const payload = { new_name: newName };
    const response = await generationApi.patch(
      `/monsters/images/${monsterId}/${imageId}/rename`,
      payload
    );
    return response.data;
  },

  // Initiate async image generation (returns batch_id)
  initiateImageGeneration: async (payload: unknown) => {
    const response = await generationApi.post(`/images/generate`, payload);
    return response.data;
  },
};

// Helper functions for validation and UI
// Les couleurs d'état vivent désormais uniquement dans les tokens --state-*
// de src/index.css (palette fixe, voir CLAUDE.md), pas ici.
export const monsterStates = [
  'GENERATED',
  'DEFECTIVE',
  'PENDING_REVIEW',
  'APPROVED',
  'TRANSMITTED',
  'REJECTED',
];

export const reviewActions = ['approve'];

/**
 * Parse JSON safely
 */
export const parseJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`JSON invalide: ${message}`);
  }
};

/**
 * Validate corrected data structure
 */
export const validateMonsterData = (data: Record<string, unknown>) => {
  const errors: string[] = [];

  if (!data.nom || typeof data.nom !== 'string') {
    errors.push('Le nom du monstre est requis');
  }

  if (!data.element) {
    errors.push("L'élément est requis");
  }

  if (!data.rang) {
    errors.push('Le rang est requis');
  }

  if (!data.stats || typeof data.stats !== 'object') {
    errors.push('Les statistiques sont requises');
  }

  if (!data.description_carte || typeof data.description_carte !== 'string') {
    errors.push('La description de carte est requise');
  }

  if (
    !data.description_visuelle ||
    typeof data.description_visuelle !== 'string'
  ) {
    errors.push('La description visuelle est requise');
  }

  if (!Array.isArray(data.skills)) {
    errors.push('Les compétences doivent être un tableau');
  }

  return errors;
};
