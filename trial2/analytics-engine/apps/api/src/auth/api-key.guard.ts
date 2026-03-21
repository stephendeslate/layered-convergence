import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const apiKey =
      request.headers['x-api-key'] ??
      request.query?.apiKey;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('Missing API key');
    }

    const result = await this.authService.validateApiKey(apiKey);
    if (!result) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.tenantId = result.tenantId;
    request.tenantName = result.tenantName;

    return true;
  }
}
