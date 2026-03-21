import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

// [TRACED:SA-001] NestJS 11 application bootstrap with fail-fast configuration checks
async function bootstrap() {
  // [TRACED:SM-001] JWT_SECRET fail-fast: application refuses to start without secret
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // [TRACED:SM-002] CORS_ORIGIN fail-fast: no fallback, must be explicitly configured
  if (!process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  const app = await NestFactory.create(AppModule);

  // [TRACED:SM-003] CORS restricted to explicit origin, credentials enabled for httpOnly cookies
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  app.use(cookieParser());

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
