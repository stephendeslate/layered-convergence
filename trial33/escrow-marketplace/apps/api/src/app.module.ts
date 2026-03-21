import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { EscrowModule } from './escrow/escrow.module';
import { DisputeModule } from './payment/dispute.module';

// TRACED: EM-AUTH-JWT-001 — JWT configured from environment
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    EscrowModule,
    DisputeModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
