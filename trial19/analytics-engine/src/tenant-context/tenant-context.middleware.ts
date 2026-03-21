import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/authenticated-request';

interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      req.tenantId = payload.tenantId;
      req.userId = payload.sub;
      req.userRole = payload.role;
      next();
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
