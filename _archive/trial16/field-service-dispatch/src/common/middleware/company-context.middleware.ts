import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      companyId?: string;
    }
  }
}

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const companyId = req.headers['x-company-id'] as string;
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
    req.companyId = companyId;
    next();
  }
}
