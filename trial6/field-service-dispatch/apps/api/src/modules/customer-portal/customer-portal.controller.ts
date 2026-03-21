import { Controller, Get, Param } from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';

@Controller('portal')
export class CustomerPortalController {
  constructor(private readonly customerPortalService: CustomerPortalService) {}

  @Get('track/:token')
  getTrackingStatus(@Param('token') token: string) {
    return this.customerPortalService.getTrackingStatus(token);
  }
}
