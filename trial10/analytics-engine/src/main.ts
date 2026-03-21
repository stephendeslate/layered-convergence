import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — ensures all DTOs are validated (convention 5.19)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Prisma exception filter (convention 5.23)
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
