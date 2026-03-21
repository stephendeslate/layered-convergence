import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// [TRACED:SA-001] NestJS 11 application bootstrap with fail-fast env checks
async function bootstrap() {
  // [TRACED:SEC-003] JWT_SECRET fail-fast check at startup
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // [TRACED:SEC-004] CORS_ORIGIN fail-fast check at startup
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // [TRACED:AC-001] Global validation pipe with whitelist and transform
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
