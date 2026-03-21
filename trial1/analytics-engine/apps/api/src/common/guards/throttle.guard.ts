import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

/**
 * Rate limiting guard using Redis sliding window counters.
 * Default: 100 requests per minute per tenant/IP.
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly limit: number;
  private readonly windowSeconds: number;

  constructor(private readonly redis: RedisService) {
    this.limit = parseInt(process.env.RATE_LIMIT ?? '100', 10);
    this.windowSeconds = parseInt(
      process.env.RATE_LIMIT_WINDOW ?? '60',
      10,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const identifier =
      request.user?.tenantId ??
      request.ip ??
      request.connection?.remoteAddress ??
      'unknown';

    const key = `rate-limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowSeconds * 1000;

    // Use Redis sorted set for sliding window
    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, this.windowSeconds);

    const results = await pipeline.exec();
    const count = results?.[2]?.[1] as number;

    if (count > this.limit) {
      throw new HttpException(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
            details: [],
            requestId: request.headers['x-request-id'] ?? '',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
