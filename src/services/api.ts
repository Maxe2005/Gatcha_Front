import { createApiClient } from './apiClient';

/**
 * API Client instances
 * Each instance is configured with centralized error handling and token injection
 */

export const monstersApi = createApiClient('/monsters-service');
export const joueurApi = createApiClient('/joueur-service');
export const authApi = createApiClient('/auth-service');
export const invocationApi = createApiClient('/invocation-service');

// Admin / Generation endpoints (migrated from legacy JS `api.js`)
export const adminApi = createApiClient('/admin-service/api/v1/admin');
export const generationApi = createApiClient('/admin-service/api/v1');
