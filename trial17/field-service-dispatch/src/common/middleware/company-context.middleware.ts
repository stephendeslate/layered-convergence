import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface JwtPayload {
  userId: string;
  companyId: string;
  role: string;
}

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = jwt.verify(token, secret!) as JwtPayload;
      (req as any).companyId = payload.companyId;
      (req as any).userId = payload.userId;
      (req as any).userRole = payload.role;
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
