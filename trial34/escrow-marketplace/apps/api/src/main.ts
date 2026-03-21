import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // TRACED: EM-SEC-FAILFAST-001 — Fail-fast on missing JWT_SECRET
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  // TRACED: EM-SEC-FAILFAST-002 — Fail-fast on missing CORS_ORIGIN
  if (!process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  const app = await NestFactory.create(AppModule);
  // TRACED: EM-SEC-CORS-001 — CORS from environment variable
  app.enableCors({ origin: process.env.CORS_ORIGIN });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
