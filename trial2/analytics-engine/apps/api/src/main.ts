import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // In production, this would check against embed allowedOrigins
      // No wildcard '*' allowed on SSE endpoints
      if (!origin || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(null, true); // Will be restricted per-route for SSE
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true,
  });

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
