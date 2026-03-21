import { Controller, Get, Param } from '@nestjs/common';
import { TrackingService } from './tracking.service';

// [PUBLIC_ENDPOINT] Customer tracking portal — no auth required
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':workOrderId')
  getTrackingData(@Param('workOrderId') workOrderId: string) {
    return this.trackingService.getTrackingData(workOrderId);
  }
}
