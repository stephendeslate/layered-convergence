import { Injectable } from '@nestjs/common';
import pino from 'pino';
import { formatLogEntry } from '@analytics-engine/shared';

// TRACED:AE-MON-003
@Injectable()
export class PinoLoggerService {
  private readonly logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  });

  error(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('error', message, context);
    this.logger.error(JSON.parse(entry));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('warn', message, context);
    this.logger.warn(JSON.parse(entry));
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('info', message, context);
    this.logger.info(JSON.parse(entry));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    const entry = formatLogEntry('debug', message, context);
    this.logger.debug(JSON.parse(entry));
  }
}
