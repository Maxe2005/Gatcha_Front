import toast from 'react-hot-toast';
import { ErrorTypes } from './apiClient';

/**
 * Notification Service
 * Centralized interface for user feedback via toasts
 */

/**
 * Show success toast notification
 * @param {string} message - Success message
 * @param {number} duration - Duration in ms (default 3000)
 */
export const notifySuccess = (message, duration = 3000) => {
  toast.success(message, {
    duration,
    position: 'bottom-right',
    style: {
      background: '#27ae60',
      color: 'white',
      fontFamily: "'Montserrat', sans-serif",
    },
  });
};

/**
 * Show error toast notification
 * @param {Error|ApiError|string} error - Error object or message
 * @param {number} duration - Duration in ms (default 4000)
 */
export const notifyError = (error, duration = 4000) => {
  let message = error;
  let icon = '❌';

  if (error?.type === ErrorTypes.NETWORK) {
    message = 'Connexion perdue...';
    icon = '📡';
  } else if (error?.type === ErrorTypes.UNAUTHORIZED) {
    message = 'Authentification requise. Veuillez vous reconnecter.';
    icon = '🔐';
  } else if (error?.type === ErrorTypes.FORBIDDEN) {
    message = 'Accès refusé';
    icon = '🚫';
  } else if (error?.type === ErrorTypes.SERVER) {
    message = 'Erreur serveur, réessayez plus tard';
    icon = '⚠️';
  } else if (error instanceof Error) {
    message = error.message || 'Une erreur s\'est produite';
  }

  toast.error(`${icon} ${message}`, {
    duration,
    position: 'bottom-right',
    style: {
      background: '#e74c3c',
      color: 'white',
      fontFamily: "'Montserrat', sans-serif",
    },
  });
};

/**
 * Show warning toast notification
 * @param {string} message - Warning message
 */
export const notifyWarning = (message) => {
  toast((t) => (
    <span>⚠️ {message}</span>
  ), {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#f39c12',
      color: 'white',
      fontFamily: "'Montserrat', sans-serif",
    },
  });
};

/**
 * Show loading toast notification
 * @param {string} message - Loading message
 * @returns {string} - Toast ID for update/dismiss
 */
export const notifyLoading = (message) => {
  return toast.loading(message, {
    position: 'bottom-right',
    style: {
      background: '#3498db',
      color: 'white',
      fontFamily: "'Montserrat', sans-serif",
    },
  });
};

/**
 * Update existing toast
 * @param {string} toastId - Toast ID from notifyLoading
 * @param {string} message - New message
 * @param {string} type - 'success', 'error', 'loading' (default 'success')
 */
export const updateToast = (toastId, message, type = 'success') => {
  if (type === 'success') {
    toast.success(message, {
      id: toastId,
      duration: 3000,
      position: 'bottom-right',
    });
  } else if (type === 'error') {
    toast.error(message, {
      id: toastId,
      duration: 4000,
      position: 'bottom-right',
    });
  }
};

/**
 * Dismiss a specific toast
 * @param {string} toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
