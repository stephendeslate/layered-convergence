import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string | undefined;
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    if (!apiKey) {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    const valid = await this.authService.validateApiKey(tenantId, apiKey);
    if (!valid) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
