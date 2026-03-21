// [TRACED:AE-007] NestJS 11 with Prisma 6 ORM backend
// [TRACED:AE-024] ValidationPipe with whitelist + forbidNonWhitelisted
// [TRACED:AE-025] Fail-fast JWT_SECRET
// [TRACED:AE-030] Fail-fast CORS_ORIGIN
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

// [TRACED:BE-001] Fail-fast on JWT_SECRET and CORS_ORIGIN
async function bootstrap() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    throw new Error("CORS_ORIGIN environment variable is required");
  }

  const app = await NestFactory.create(AppModule);

  // [TRACED:BE-002] ValidationPipe with whitelist + forbidNonWhitelisted
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: corsOrigin });

  const port = process.env.PORT || 3001;
  await app.listen(port);
}
bootstrap();
