import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

interface JwtPayloadRequest extends Request {
  user?: {
    userId: string;
    companyId: string;
    role: string;
  };
}

// TRACED:SA-004 Company context set on every authenticated request
@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CompanyContextMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(
    req: JwtPayloadRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    if (req.user?.companyId) {
      // Use $executeRaw with tagged template — NEVER $executeRawUnsafe
      await this.prisma.$executeRaw`SELECT set_config('app.current_company_id', ${req.user.companyId}, true)`;
      this.logger.debug(`Company context set to ${req.user.companyId}`);
    }
    next();
  }
}
