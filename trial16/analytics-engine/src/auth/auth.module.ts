import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      // FM #43: JWT_SECRET from env with NO fallback default — app fails to start without it
      secret: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error(
            'JWT_SECRET environment variable is required. Cannot start without it.',
          );
        }
        return secret;
      })(),
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || '3600s',
      },
    }),
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
