import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

/**
 * FM #44: JWT always verified with proper crypto.
 * The secret is injected from ConfigService — never hardcoded.
 * passport-jwt handles full cryptographic verification (signature, expiry).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Called after JWT signature and expiry are verified by passport-jwt.
   * Returns the payload that gets attached to request.user.
   */
  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<CurrentUserPayload> {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
