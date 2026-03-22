// TRACED:AE-CURRENT-USER-DECORATOR
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as Record<string, unknown>)['user'] as JwtPayload;
    return data ? user[data] : user;
  },
);
