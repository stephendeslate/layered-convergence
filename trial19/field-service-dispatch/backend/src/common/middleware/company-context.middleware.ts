import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.slice(7);
    try {
      const decoded = this.jwtService.verify<{
        sub: string;
        email: string;
        role: string;
        companyId: string;
      }>(token);

      req.companyId = decoded.companyId;
      req.userId = decoded.sub;
      req.userRole = decoded.role;
      next();
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
