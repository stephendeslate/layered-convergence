import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '@field-service/shared';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as Request & { user?: JwtPayload }).user;
    if (user?.companyId) {
      await this.prisma.setTenantContext(user.companyId);
    }
    next();
  }
}
