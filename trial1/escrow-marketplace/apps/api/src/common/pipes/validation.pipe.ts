import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

/**
 * Pre-configured validation pipe for use in controllers.
 * Global pipe is set in main.ts; this export is for per-route overrides.
 */
export const StrictValidationPipe = new NestValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});
