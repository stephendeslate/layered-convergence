// TRACED: EM-INFRA-001 — 3-stage Dockerfile with node:20-alpine
// TRACED: EM-INFRA-002 — USER node in production stage
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // TRACED: EM-ARCH-003 — Fail-fast env validation
  // TRACED: EM-ARCH-006 — Environment variable fail-fast validation
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  const app = await NestFactory.create(AppModule);

  // TRACED: EM-SEC-001 — Helmet with CSP directives
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  // TRACED: EM-SEC-003 — CORS restricted to configured origin
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // TRACED: EM-SEC-004 — Input validation with class-validator
  // TRACED: EM-API-007 — Whitelist validation pipe (strip unknown fields)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
}

bootstrap();
