/**
 * Centralized Logger Service
 * Replaces console.log to control output in dev vs production
 */

const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  level: number;
  isDev: boolean;
  constructor() {
    // In production: only show WARN and ERROR
    // In development: show all levels
    this.level =
      process.env.NODE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG;
    this.isDev = process.env.NODE_ENV === 'development';
  }

  /**
   * Debug level log
   * @param {string} namespace - Component/module name
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  debug(namespace, message, data = {}) {
    if (this.level <= LOG_LEVEL.DEBUG && this.isDev) {
      console.debug(`[${namespace}]`, message, data);
    }
  }

  /**
   * Info level log
   * @param {string} namespace - Component/module name
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  info(namespace, message, data = {}) {
    if (this.level <= LOG_LEVEL.INFO && this.isDev) {
      console.info(`[${namespace}]`, message, data);
    }
  }

  /**
   * Warn level log
   * @param {string} namespace - Component/module name
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  warn(namespace, message, data = {}) {
    if (this.level <= LOG_LEVEL.WARN) {
      console.warn(`[${namespace}]`, message, data);
    }
  }

  /**
   * Error level log
   * @param {string} namespace - Component/module name
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  error(namespace, message, data = {}) {
    if (this.level <= LOG_LEVEL.ERROR) {
      console.error(`[${namespace}]`, message, data);
    }
  }
}

export const logger = new Logger();
