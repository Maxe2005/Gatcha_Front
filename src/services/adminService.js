import { adminApi, generationApi } from './api';

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

  getMonsterDetail: async (monsterId) => {
    const response = await adminApi.get(`/monsters/${monsterId}`);
    return response.data;
  },

  getMonsterHistory: async (monsterId) => {
    const response = await adminApi.get(`/monsters/${monsterId}/history`);
    return response.data;
  },

  reviewMonster: async (monsterId, action, notes = null) => {
    const payload = {
      action,
      notes,
    };
    const response = await adminApi.post(
      `/monsters/${monsterId}/review`,
      payload
    );
    return response.data;
  },

  correctMonster: async (monsterId, correctedData, notes = null) => {
    const payload = {
      corrected_data: correctedData,
      notes,
    };
    const response = await adminApi.post(
      `/monsters/${monsterId}/correct`,
      payload
    );
    return response.data;
  },

  // Validation rules endpoint
  getValidationRules: async () => {
    const response = await adminApi.get('/validation-rules');
    return response.data;
  },

  // Legacy defective JSON endpoints
  getDefectiveMonsters: async () => {
    const response = await adminApi.get('/defective');
    return response.data;
  },

  getDefectiveDetail: async (filename) => {
    const response = await adminApi.get(`/defective/${filename}`);
    return response.data;
  },

  validateDefective: async (filename) => {
    const response = await adminApi.post(`/defective/${filename}/validate`);
    return response.data;
  },

  updateDefective: async (filename, correctedData, notes = null) => {
    const payload = {
      corrected_data: correctedData,
      notes,
    };
    const response = await adminApi.put(
      `/defective/${filename}/update`,
      payload
    );
    return response.data;
  },

  approveDefective: async (filename, correctedData, notes = null) => {
    const payload = {
      corrected_data: correctedData,
      notes,
    };
    const response = await adminApi.post(
      `/defective/${filename}/approve`,
      payload
    );
    return response.data;
  },

  rejectDefective: async (filename, reason) => {
    const payload = { reason };
    const response = await adminApi.post(
      `/defective/${filename}/reject`,
      payload
    );
    return response.data;
  },

  // Process a single generated monster
  processGeneratedMonster: async (monsterId) => {
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

  // Monster images endpoints
  getMonsterImages: async (monsterId) => {
    const response = await generationApi.get(`/monsters/images/${monsterId}`);
    return response.data;
  },

  setMonsterDefaultImage: async (monsterId, imageId) => {
    const payload = { image_id: imageId };
    const response = await generationApi.put(
      `/monsters/images/${monsterId}/default`,
      payload
    );
    return response.data;
  },

  // Initiate async image generation (returns batch_id)
  initiateImageGeneration: async (payload) => {
    const response = await generationApi.post(`/images/generate`, payload);
    return response.data;
  },

  // Legacy synchronous version (kept for backward compatibility)
  generateMonsterImage: async (payload) => {
    const response = await generationApi.post(
      `/monsters/images/generate`,
      payload
    );
    return response.data;
  },
};

// Helper functions for validation and UI
export const monsterStateColors = {
  GENERATED: '#a0aec0',
  DEFECTIVE: '#e53e3e',
  PENDING_REVIEW: '#ecc94b',
  APPROVED: '#48bb78',
  TRANSMITTED: '#4299e1',
  REJECTED: '#ed8936',
};

export const monsterStates = [
  'GENERATED',
  'DEFECTIVE',
  'PENDING_REVIEW',
  'APPROVED',
  'TRANSMITTED',
  'REJECTED',
];

export const reviewActions = ['approve', 'reject'];

/**
 * Parse JSON safely
 */
export const parseJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`JSON invalide: ${error.message}`);
  }
};

/**
 * Validate corrected data structure
 */
export const validateMonsterData = (data) => {
  const errors = [];

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
