// TRACED: EM-ARCH-004 — Data flow from frontend Server Actions through API to database
// TRACED: EM-SEC-001 — Helmet CSP configuration
// TRACED: EM-SEC-002 — CORS from environment variable
// TRACED: EM-SEC-004 — ValidationPipe with whitelist and forbidNonWhitelisted
// TRACED: EM-MON-003 — Pino structured JSON logging in NestJS
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createCorrelationId, formatLogEntry } from '@escrow-marketplace/shared';

async function bootstrap() {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} environment variable is required`);
    }
  }

  const app = await NestFactory.create(AppModule, {
    logger: {
      log(message: string) { process.stdout.write(formatLogEntry('info', message, { correlationId: createCorrelationId() }) + '\n'); },
      error(message: string) { process.stderr.write(formatLogEntry('error', message) + '\n'); },
      warn(message: string) { process.stdout.write(formatLogEntry('warn', message) + '\n'); },
      debug(message: string) { process.stdout.write(formatLogEntry('debug', message) + '\n'); },
      verbose(message: string) { process.stdout.write(formatLogEntry('debug', message) + '\n'); },
      fatal(message: string) { process.stderr.write(formatLogEntry('error', message) + '\n'); },
    },
  });

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

  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Correlation-ID'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
}

bootstrap();
