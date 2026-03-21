import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { TechnicianModule } from './technician/technician.module';

// TRACED: FD-AUTH-JWT-001 — JWT configured from environment
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    DispatchModule,
    TechnicianModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
