// TRACED: FD-METRICS-ENDPOINT
import { Controller, Get, Post, Body } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { MetricsService } from './metrics.service';
import { PinoLoggerService } from './pino-logger.service';

@Controller()
@SkipThrottle()
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly logger: PinoLoggerService,
  ) {}

  @Get('metrics')
  @Public()
  getMetrics() {
    return this.metricsService.getMetrics();
  }

  // TRACED: FD-FRONTEND-ERROR-ENDPOINT
  @Post('errors')
  @Public()
  logFrontendError(
    @Body() body: { message: string; stack?: string; componentStack?: string },
  ) {
    this.logger.error('Frontend error', body.stack, {
      source: 'frontend',
      message: body.message,
      componentStack: body.componentStack,
    });
    return { received: true };
  }
}
