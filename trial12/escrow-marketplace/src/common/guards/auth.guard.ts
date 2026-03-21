import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    let userId: string;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded) as { userId: string };
      userId = parsed.userId;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // findFirst used here: lookup by primary key, guaranteed unique by schema
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Type assertion justified: attaching authenticated user to request object for downstream access
    (request as unknown as Record<string, unknown>)['user'] = user;
    return true;
  }
}
