/**
 * Structured Logger Utility
 *
 * Simple logger with JSON-formatted output for debugging and monitoring
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // Use console.error for error level, console.log for others
    const consoleMethod = level === 'error' ? 'error' : 'log';
    console[consoleMethod](JSON.stringify(logEntry));
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext) {
    // Only log debug messages in development
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
