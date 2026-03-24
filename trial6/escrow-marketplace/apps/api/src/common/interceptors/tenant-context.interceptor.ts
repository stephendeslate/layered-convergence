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
    const userId = request.user?.id;

    if (userId) {
      // Parameterized $executeRaw — never use $executeRawUnsafe (CED v5.0+)
      await this.prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}::text, true)`;
    }

    return next.handle();
  }
}
