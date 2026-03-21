import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/auth.dto';

/**
 * FM #43: Tenant context middleware derives tenant identity SOLELY from JWT.
 * NO x-tenant-id header override is accepted — that would be a security vulnerability.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async use(
    req: Request & { tenantId?: string; user?: JwtPayload },
    _res: Response,
    next: NextFunction,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token required');
    }

    try {
      // FM #44: Proper cryptographic verification via JwtService
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // FM #43: Tenant ID comes ONLY from the JWT — never from headers
      req.tenantId = payload.tenantId;
      req.user = payload;

      // Set RLS context for database queries
      await this.prisma.setTenantContext(payload.tenantId);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    next();
  }
}
