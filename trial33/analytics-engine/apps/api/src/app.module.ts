import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PipelineModule } from './pipeline/pipeline.module';

// TRACED: AE-AUTH-JWT-001 — JWT configured from environment
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    DashboardModule,
    PipelineModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
