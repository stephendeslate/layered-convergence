import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    // Priority 1: Explicit tenant header
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenantId) {
      req.tenantId = headerTenantId;
      next();
      return;
    }

    // Priority 2: Extract from JWT
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = this.authService.extractTokenFromHeader(authHeader);
    if (token) {
      try {
        const payload = this.authService.verify(token);
        req.tenantId = payload.tenantId;
      } catch {
        // Token invalid — tenantId remains undefined
      }
    }

    next();
  }
}
