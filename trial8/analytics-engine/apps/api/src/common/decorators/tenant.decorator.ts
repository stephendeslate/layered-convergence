import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the tenant object from the request (set by ApiKeyGuard).
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);
