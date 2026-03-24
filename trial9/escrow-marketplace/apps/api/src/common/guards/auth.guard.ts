import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Simple auth guard that verifies the x-user-id header is present.
 * In production, this would validate a JWT or session token.
 * For CED trials, we use header-based identity to focus on business logic.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.headers['x-user-id'] as string;

    if (!userId) {
      throw new UnauthorizedException('User identity required');
    }

    (request as Record<string, unknown>)['userId'] = userId;
    return true;
  }
}
