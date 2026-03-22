// TRACED:EM-APP-02 main.ts with Helmet CSP and CORS
// TRACED:EM-INFRA-01 Multi-stage Dockerfile entry point
// TRACED:EM-SEC-03 RLS enforced via migrations
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggerService } from './monitoring/logger.service';
import { validateEnv } from './common/config/env.validation';

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`, 'Bootstrap');
}

bootstrap();
