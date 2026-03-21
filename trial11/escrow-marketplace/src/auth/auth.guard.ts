import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const payload = this.authService.parseToken(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.authService.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // type assertion justified: extending Express Request with user property for downstream handlers
    (request as any).user = user;
    return true;
  }
}
