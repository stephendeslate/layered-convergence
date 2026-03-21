// [TRACED:AE-025] Fail-fast JWT_SECRET validation
// [TRACED:AE-030] Fail-fast CORS_ORIGIN validation
// [TRACED:AE-024] ValidationPipe with whitelist + forbidNonWhitelisted
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

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
