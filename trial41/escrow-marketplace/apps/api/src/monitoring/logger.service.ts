// TRACED:EM-MON-03 Pino structured logger service
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label: string) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  log(message: string, context?: string): void {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string): void {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string): void {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({ context }, message);
  }

  logWithCorrelation(
    level: 'info' | 'error' | 'warn' | 'debug',
    message: string,
    meta: Record<string, unknown>,
  ): void {
    this.logger[level](meta, message);
  }
}
