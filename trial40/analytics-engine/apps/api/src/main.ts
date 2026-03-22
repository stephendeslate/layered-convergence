// TRACED:AE-ARCH-03 — NestJS bootstrap with Pino logger, Helmet, CORS, ValidationPipe
// TRACED:AE-INFRA-04 — Environment variable validation at startup (no fallbacks)
// TRACED:AE-MON-11 — Pino structured logging in bootstrap

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PinoLoggerService } from './monitoring/logger.provider';

async function bootstrap(): Promise<void> {
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const logger = new PinoLoggerService();
  const app = await NestFactory.create(AppModule, { logger });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Analytics Engine API running on port ${port}`);
}

bootstrap();
