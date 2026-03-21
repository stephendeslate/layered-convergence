import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const companyId =
      request.headers['x-company-id'] ?? request.user?.companyId;

    if (companyId) {
      // Parameterized $executeRaw — never use $executeRawUnsafe (SDD v5.0+)
      await this.prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${companyId}::text, true)`;
    }

    return next.handle();
  }
}
