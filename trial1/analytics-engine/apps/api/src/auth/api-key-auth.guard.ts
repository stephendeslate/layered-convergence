import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';

/**
 * Guard for API key authentication used by embed endpoints.
 * Looks for the API key in the X-API-Key header or apiKey query parameter.
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const apiKeyRaw =
      (request.headers['x-api-key'] as string) ??
      (request.query?.apiKey as string);

    if (!apiKeyRaw) {
      throw new UnauthorizedException('API key required');
    }

    const keyHash = createHash('sha256').update(apiKeyRaw).digest('hex');
    const apiKey = await this.authService.validateApiKey(keyHash);

    // Attach tenant and API key info to request
    request.user = {
      tenantId: apiKey.tenantId,
      apiKeyId: apiKey.id,
      apiKeyType: apiKey.type,
      tier: apiKey.tenant.tier,
    };

    return true;
  }
}
