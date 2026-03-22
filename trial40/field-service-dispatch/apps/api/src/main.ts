// TRACED: FD-API-001 — Bootstrap with fail-fast env validation and Pino structured logging
// TRACED: FD-SEC-001 — Helmet with Content Security Policy
// TRACED: FD-SEC-003 — CORS from environment with explicit headers and methods
// TRACED: FD-MON-003 — Pino structured JSON logger integrated at bootstrap
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import pino from 'pino';
import { AppModule } from './app.module';
import { CorrelationMiddleware } from './monitoring/correlation.middleware';
import { RequestLoggerMiddleware } from './monitoring/request-logger.middleware';

async function bootstrap() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  const app = await NestFactory.create(AppModule, {
    logger: {
      log: (message: string) => logger.info(message),
      error: (message: string, trace?: string) => logger.error({ trace }, message),
      warn: (message: string) => logger.warn(message),
      debug: (message: string) => logger.debug(message),
      verbose: (message: string) => logger.trace(message),
    },
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        frameAncestors: ["'none'"],
      },
    },
  }));

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-ID'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
