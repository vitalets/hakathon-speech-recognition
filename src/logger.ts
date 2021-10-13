/**
 * Logger
 */
import consoleLogLevel, { LogLevelNames } from 'console-log-level';

const logLevel = process.env.LOG_LEVEL || 'info';

export class Logger {
  logger: consoleLogLevel.Logger;

  constructor(prefix = '') {
    prefix = prefix ? `[${prefix}]` : '';
    this.logger = consoleLogLevel({ prefix, level: logLevel as LogLevelNames });
  }

  error(e: Error) {
    this.logger.error(e);
  }

  log(...args: unknown[]) {
    this.logger.info(...args);
  }

  debug(...args: unknown[]) {
    this.logger.debug(...args);
  }
}

// default logger
export const logger = new Logger();
