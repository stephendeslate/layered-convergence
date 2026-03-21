import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the company object from the request (set by CompanyGuard).
 */
export const CurrentCompany = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.company;
  },
);
