// [TRACED:FD-024] ValidationPipe with whitelist and forbidNonWhitelisted
// [TRACED:FD-025] Fail-fast on missing JWT_SECRET
// [TRACED:FD-030] Fail-fast on missing CORS_ORIGIN
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  if (!process.env.CORS_ORIGIN) {
    throw new Error("CORS_ORIGIN environment variable is required");
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
