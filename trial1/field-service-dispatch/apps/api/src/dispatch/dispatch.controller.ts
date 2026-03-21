import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { CurrentCompany, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/decorators';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('auto-assign/:workOrderId')
  @Roles('ADMIN', 'DISPATCHER')
  @HttpCode(HttpStatus.OK)
  async autoAssignSingle(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('workOrderId') workOrderId: string,
  ) {
    const today = new Date().toISOString().split('T')[0];
    return this.dispatchService.autoAssign(
      companyId,
      { date: today, workOrderIds: [workOrderId] },
      user.sub,
    );
  }

  @Post('auto-assign')
  @Roles('ADMIN', 'DISPATCHER')
  @HttpCode(HttpStatus.OK)
  async autoAssign(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body()
    body: {
      date: string;
      workOrderIds?: string[];
      technicianIds?: string[];
      dryRun?: boolean;
    },
  ) {
    return this.dispatchService.autoAssign(companyId, body, user.sub);
  }

  @Post('optimize-routes')
  @Roles('ADMIN', 'DISPATCHER')
  @HttpCode(HttpStatus.OK)
  async optimizeRoutes(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { date: string; technicianId?: string },
  ) {
    return this.dispatchService.optimizeRoutes(
      companyId,
      body.date,
      body.technicianId,
      user.sub,
    );
  }

  @Get('board')
  @Roles('ADMIN', 'DISPATCHER')
  async board(
    @CurrentCompany() companyId: string,
    @Query('date') date?: string,
  ) {
    return this.dispatchService.getDispatchBoard(companyId, date);
  }
}
