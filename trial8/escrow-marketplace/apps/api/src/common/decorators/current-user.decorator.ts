import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the user object from the request (set by AuthGuard).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
