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
    const tenantId = request.headers['x-tenant-id'] ?? request.user?.tenantId;

    if (tenantId) {
      // Parameterized $executeRaw — never use $executeRawUnsafe (CED v5.0+)
      await this.prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}::text, true)`;
    }

    return next.handle();
  }
}
