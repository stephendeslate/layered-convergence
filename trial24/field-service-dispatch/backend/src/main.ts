// [TRACED:SEC-003] JWT_SECRET fail-fast: application throws if JWT_SECRET is not set
// [TRACED:SEC-004] CORS_ORIGIN fail-fast: application throws if CORS_ORIGIN is not set
// [TRACED:SEC-005] ValidationPipe with whitelist and forbidNonWhitelisted globally
// [TRACED:CQ-002] Zero console.log in production code — uses NestJS Logger

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: corsOrigin,
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
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
