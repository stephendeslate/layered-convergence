import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1] || '', 'base64').toString(),
      );
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
