import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../redis/redis.service';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleConfig {
  limit: number;
  windowSec: number;
}

/**
 * Redis-backed sliding window rate limiter with role-based limits.
 *
 * Default limits per minute:
 * - Public (unauthenticated): 20 req/min
 * - Authenticated: 60 req/min
 * - Admin: 120 req/min
 *
 * Custom limits can be applied per handler via @SetMetadata('throttle', { limit, windowSec })
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  private static readonly ROLE_LIMITS: Record<string, ThrottleConfig> = {
    PUBLIC: { limit: 20, windowSec: 60 },
    BUYER: { limit: 60, windowSec: 60 },
    PROVIDER: { limit: 60, windowSec: 60 },
    ADMIN: { limit: 120, windowSec: 60 },
  };

  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check for handler-level custom throttle config
    const customConfig = this.reflector.get<ThrottleConfig>(
      THROTTLE_KEY,
      context.getHandler(),
    );

    const user = request.user;
    const role = user?.role || 'PUBLIC';
    const config = customConfig || ThrottleGuard.ROLE_LIMITS[role] || ThrottleGuard.ROLE_LIMITS.PUBLIC;

    // Key: authenticated users by userId, unauthenticated by IP
    const identifier = user?.id || request.ip || request.connection?.remoteAddress || 'unknown';
    const key = `throttle:${role}:${identifier}`;

    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, config.windowSec);
      }

      // Set rate limit headers
      const ttl = await this.redis.ttl(key);
      response.set?.('X-RateLimit-Limit', String(config.limit));
      response.set?.('X-RateLimit-Remaining', String(Math.max(0, config.limit - current)));
      response.set?.('X-RateLimit-Reset', String(ttl > 0 ? ttl : config.windowSec));

      if (current > config.limit) {
        const retryAfter = ttl > 0 ? ttl : config.windowSec;
        response.set?.('Retry-After', String(retryAfter));
        throw new HttpException(
          {
            statusCode: 429,
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (error) {
      // If Redis is down, allow the request through
      if (error instanceof HttpException) throw error;
    }

    return true;
  }
}
