import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface CompanyRequest extends Request {
  companyId: string;
}

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  use(req: CompanyRequest, _res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    const companyId = this.extractCompanyId(token);

    if (!companyId) {
      throw new UnauthorizedException('Invalid token: missing companyId');
    }

    req.companyId = companyId;
    next();
  }

  private extractCompanyId(token: string): string | null {
    try {
      // Simple base64 JWT payload extraction (no verification for this service)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(parts[1]!, 'base64').toString());
      return payload.companyId ?? null;
    } catch {
      return null;
    }
  }
}
