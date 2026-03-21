import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];

    if (userId) {
      await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      }).catch(() => {
        throw new UnauthorizedException('Invalid user ID');
      });
      request.userId = userId;
      await this.prisma.setUserContext(userId);
      return true;
    }

    // Allow requests without user context for admin/webhook endpoints
    return true;
  }
}
