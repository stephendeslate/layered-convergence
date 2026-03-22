// TRACED: EM-LOG-001
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';
import { formatLogEntry } from '@escrow-marketplace/shared';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  log(message: string, context?: Record<string, unknown>) {
    const entry = formatLogEntry('info', message, context);
    this.logger.info(JSON.parse(entry));
  }

  error(message: string, context?: Record<string, unknown>) {
    const entry = formatLogEntry('error', message, context);
    this.logger.error(JSON.parse(entry));
  }

  warn(message: string, context?: Record<string, unknown>) {
    const entry = formatLogEntry('warn', message, context);
    this.logger.warn(JSON.parse(entry));
  }

  debug(message: string, context?: Record<string, unknown>) {
    const entry = formatLogEntry('debug', message, context);
    this.logger.debug(JSON.parse(entry));
  }
}
