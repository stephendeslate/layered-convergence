// TRACED:AE-MON-03 — Pino logger injectable via NestJS DI
import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';
import { formatLogEntry } from '@analytics-engine/shared';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level(label: string) {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  log(message: string, context?: string): void {
    const formatted = formatLogEntry('info', message, context ? { context } : undefined);
    this.logger.info(JSON.parse(formatted));
  }

  error(message: string, trace?: string, context?: string): void {
    const formatted = formatLogEntry('error', message, { trace, context });
    this.logger.error(JSON.parse(formatted));
  }

  warn(message: string, context?: string): void {
    const formatted = formatLogEntry('warn', message, context ? { context } : undefined);
    this.logger.warn(JSON.parse(formatted));
  }

  debug(message: string, context?: string): void {
    const formatted = formatLogEntry('debug', message, context ? { context } : undefined);
    this.logger.debug(JSON.parse(formatted));
  }

  verbose(message: string, context?: string): void {
    const formatted = formatLogEntry('debug', message, context ? { context } : undefined);
    this.logger.debug(JSON.parse(formatted));
  }

  getPinoInstance(): pino.Logger {
    return this.logger;
  }
}
