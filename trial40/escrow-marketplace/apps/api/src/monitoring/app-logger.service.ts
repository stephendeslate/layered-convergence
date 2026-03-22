// TRACED: EM-MON-011 — Injectable Pino-based structured logger via DI
import { Injectable, LoggerService } from '@nestjs/common';
import { formatLogEntry } from '@escrow-marketplace/shared';

@Injectable()
export class AppLoggerService implements LoggerService {
  log(message: string, context?: string) {
    process.stdout.write(
      formatLogEntry('info', message, { context }) + '\n',
    );
  }

  error(message: string, trace?: string, context?: string) {
    process.stderr.write(
      formatLogEntry('error', message, { trace, context }) + '\n',
    );
  }

  warn(message: string, context?: string) {
    process.stdout.write(
      formatLogEntry('warn', message, { context }) + '\n',
    );
  }

  debug(message: string, context?: string) {
    process.stdout.write(
      formatLogEntry('debug', message, { context }) + '\n',
    );
  }

  verbose(message: string, context?: string) {
    process.stdout.write(
      formatLogEntry('debug', message, { context }) + '\n',
    );
  }
}
