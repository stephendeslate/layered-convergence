import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly secret: string;
  private readonly expiresIn: number;

  constructor() {
    this.secret = process.env['JWT_SECRET'] ?? 'default-secret-change-in-production';
    this.expiresIn = parseInt(process.env['JWT_EXPIRES_IN'] ?? '3600', 10);
  }

  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenResponse {
    const accessToken = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
    return { accessToken, expiresIn: this.expiresIn };
  }

  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Invalid token payload: missing sub or tenantId');
    }
    return payload;
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;
    return token;
  }
}
