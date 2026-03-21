import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const companyId = req.headers['x-company-id'];
    if (!companyId || typeof companyId !== 'string') {
      throw new BadRequestException(
        'x-company-id header is required',
      );
    }
    // Type assertion justified: we are extending Express Request with a custom property
    (req as Request & { companyId: string }).companyId = companyId;
    next();
  }
}
