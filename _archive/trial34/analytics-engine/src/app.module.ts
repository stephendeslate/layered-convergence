import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { PipelineRunsModule } from './pipeline-runs/pipeline-runs.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { TransformationsModule } from './transformations/transformations.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { QueryCacheModule } from './query-cache/query-cache.module';
import { DeadLetterEventsModule } from './dead-letter-events/dead-letter-events.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    PipelinesModule,
    PipelineRunsModule,
    DataSourcesModule,
    TransformationsModule,
    DashboardsModule,
    QueryCacheModule,
    DeadLetterEventsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
