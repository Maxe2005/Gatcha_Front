import { createApiClient } from './apiClient';

/**
 * API Client instances
 * Each instance is configured with centralized error handling and token injection
 */

export const monstersApi = createApiClient('/monsters-service');
export const joueurApi = createApiClient('/joueur-service');
export const authApi = createApiClient('/auth-service');
export const invocationApi = createApiClient('/invocation-service');
