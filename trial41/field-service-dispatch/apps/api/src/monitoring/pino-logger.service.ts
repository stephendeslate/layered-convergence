import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';

// TRACED: FD-PINO-LOGGER
@Injectable()
export class PinoLoggerService implements LoggerService {
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

  info(data: Record<string, unknown>, message: string): void {
    this.logger.info(data, message);
  }

  errorWithData(data: Record<string, unknown>, message: string): void {
    this.logger.error(data, message);
  }
}
