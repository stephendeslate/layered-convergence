import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';

@Controller('dispatch')
@UseGuards(CompanyGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('auto-assign/:workOrderId')
  autoAssign(
    @CompanyId() companyId: string,
    @Param('workOrderId') workOrderId: string,
  ) {
    return this.dispatchService.autoAssign(companyId, workOrderId);
  }

  @Get('board')
  getDispatchBoard(@CompanyId() companyId: string) {
    return this.dispatchService.getDispatchBoard(companyId);
  }

  @Get('analytics')
  getAnalytics(@CompanyId() companyId: string) {
    return this.dispatchService.getAnalytics(companyId);
  }
}
