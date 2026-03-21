import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  companyId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      companyId?: string;
      userId?: string;
      userRole?: string;
    }
  }
}

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  }

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      // FM #44: Proper JWT verification — NOT raw base64 decode
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      req.companyId = payload.companyId;
      req.userId = payload.sub;
      req.userRole = payload.role;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    next();
  }
}
