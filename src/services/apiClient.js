import axios from 'axios';

/**
 * Centralized API Error Handling
 * @type {Object} ErrorTypes - Enumeration of API error types
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(type, message, statusCode = null, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date();
  }
}

/**
 * Parse API error response and return standardized ApiError
 * @param {Error} error - Axios error object
 * @returns {ApiError} - Standardized error
 */
export const parseApiError = (error) => {
  if (!error.response) {
    return new ApiError(
      ErrorTypes.NETWORK,
      'Connexion perdue. Vérifiez votre connexion internet.',
      null,
      error
    );
  }

  const { status, data } = error.response;
  let type, message;

  switch (status) {
    case 400:
      type = ErrorTypes.VALIDATION;
      message = data?.message || 'Données invalides';
      break;
    case 401:
      type = ErrorTypes.UNAUTHORIZED;
      message = 'Authentification requise. Veuillez vous reconnecter.';
      break;
    case 403:
      type = ErrorTypes.FORBIDDEN;
      message = "Vous n'avez pas accès à cette ressource";
      break;
    case 404:
      type = ErrorTypes.NOT_FOUND;
      message = 'Ressource non trouvée';
      break;
    case 500:
    case 502:
    case 503:
      type = ErrorTypes.SERVER;
      message = 'Erreur serveur. Réessayez dans quelques instants.';
      break;
    default:
      type = ErrorTypes.UNKNOWN;
      message = data?.message || "Une erreur s'est produite";
  }

  return new ApiError(type, message, status, error);
};

/**
 * Create API client instance with centralized error handling
 * @param {string} baseURL - API base URL
 * @returns {AxiosInstance} - Configured axios instance
 */
export const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Request interceptor - Add token to all requests
  instance.interceptors.request.use((config) => {
    const match = document.cookie.match(/token=([^;]+)/);
    if (match) {
      config.headers.Authorization = `Bearer ${match[1]}`;
    }
    return config;
  });

  // Response interceptor - Standardize error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError = parseApiError(error);
      throw apiError;
    }
  );

  return instance;
};
