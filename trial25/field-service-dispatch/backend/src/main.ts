// [TRACED:SA-005] Fail-fast validation requiring JWT_SECRET and CORS_ORIGIN
// [TRACED:SA-006] ValidationPipe configured with whitelist:true and forbidNonWhitelisted:true
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (!process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
