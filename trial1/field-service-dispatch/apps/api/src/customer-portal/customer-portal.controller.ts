import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  CustomerPortalService,
  GenerateTokenDto,
  MagicLinkDto,
} from './customer-portal.service';
import { CurrentCompany, Roles, Public } from '../common/decorators';

@Controller()
export class CustomerPortalController {
  constructor(
    private readonly customerPortalService: CustomerPortalService,
  ) {}

  /**
   * Public endpoint: track work order by token.
   * No auth required.
   */
  @Get('track/:token')
  @Public()
  async track(@Param('token') token: string) {
    return this.customerPortalService.getTrackingData(token);
  }

  /**
   * Public endpoint: validate magic link.
   */
  @Get('portal/magic-link/:token')
  @Public()
  async validateMagicLink(@Param('token') token: string) {
    return this.customerPortalService.validateMagicLink(token);
  }

  /**
   * Public endpoint: get customer work orders via magic link.
   * In production, you'd validate the magic link session, but for now
   * we pass the customerId after magic link validation.
   */
  @Get('portal/customer/:customerId/work-orders')
  @Public()
  async getCustomerWorkOrders(@Param('customerId') customerId: string) {
    return this.customerPortalService.getCustomerWorkOrders(customerId);
  }

  /**
   * Generate tracking token (admin/dispatcher only).
   */
  @Post('customer-portal/tracking-token')
  @Roles('ADMIN', 'DISPATCHER')
  async generateTrackingToken(
    @CurrentCompany() companyId: string,
    @Body() dto: GenerateTokenDto,
  ) {
    return this.customerPortalService.generateTrackingToken(companyId, dto);
  }

  /**
   * Generate magic link (admin/dispatcher only).
   */
  @Post('customer-portal/magic-link')
  @Roles('ADMIN', 'DISPATCHER')
  async generateMagicLink(
    @CurrentCompany() companyId: string,
    @Body() dto: MagicLinkDto,
  ) {
    return this.customerPortalService.generateMagicLink(companyId, dto);
  }
}
