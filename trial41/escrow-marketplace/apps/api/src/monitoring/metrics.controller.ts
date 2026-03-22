// TRACED:EM-MON-09 metrics endpoint
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';

@Controller('metrics')
@SkipThrottle()
@Public()
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  getMetrics() {
    return this.metrics.getMetrics();
  }
}
