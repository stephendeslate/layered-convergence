import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const companyId = request.headers['x-company-id'];

    if (companyId) {
      await this.prisma.company.findUniqueOrThrow({
        where: { id: companyId },
      }).catch(() => {
        throw new UnauthorizedException('Invalid company ID');
      });
      request.companyId = companyId;
      await this.prisma.setCompanyContext(companyId);
      return true;
    }

    // Allow requests without company context for public/tracking endpoints
    return true;
  }
}
