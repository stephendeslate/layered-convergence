// TRACED: FD-PINO-LOGGER
import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';
import { formatLogEntry } from '@field-service-dispatch/shared';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger = pino({ level: 'debug' });

  log(message: string, context?: Record<string, unknown>): void {
    this.logger.info(formatLogEntry('info', message, context));
  }

  error(
    message: string,
    trace?: string,
    context?: Record<string, unknown>,
  ): void {
    this.logger.error(
      formatLogEntry('error', message, { ...context, trace }),
    );
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(formatLogEntry('warn', message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(formatLogEntry('debug', message, context));
  }
}
