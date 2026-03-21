import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // TRACED:SM-002: JWT_SECRET fails fast if missing
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // TRACED:SM-003: CORS_ORIGIN fails fast if missing
  if (!process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // TRACED:SM-005: ValidationPipe uses whitelist and forbidNonWhitelisted
  // TRACED:SA-005: Global ValidationPipe with whitelist enabled
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });

  await app.listen(3001);
}
bootstrap();
