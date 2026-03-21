// TRACED:JWT_FAILFAST — Application fails to start if JWT_SECRET is not set
// TRACED:CORS_FAILFAST — Application fails to start if CORS_ORIGIN is not set
// TRACED:GLOBAL_VALIDATION_PIPE — ValidationPipe with whitelist and forbidNonWhitelisted is set globally
// TRACED:VALIDATION_WHITELIST — ValidationPipe uses whitelist: true and forbidNonWhitelisted: true
// TRACED:NO_CONSOLE_LOG — Zero console.log statements in production code (using Logger instead)

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
