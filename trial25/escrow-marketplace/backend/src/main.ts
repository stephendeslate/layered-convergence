import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

// [TRACED:SA-005] main.ts with fail-fast on JWT_SECRET and CORS_ORIGIN
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET environment variable is required');
    process.exit(1);
  }

  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    logger.error('CORS_ORIGIN environment variable is required');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // [TRACED:SA-006] ValidationPipe with whitelist and forbidNonWhitelisted
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: corsOrigin });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Escrow Marketplace API running on port ${port}`);
}

bootstrap();
