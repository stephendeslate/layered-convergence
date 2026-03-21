import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('dispatch')
@UseGuards(CompanyGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('auto-assign/:workOrderId')
  autoAssign(@Param('workOrderId') workOrderId: string) {
    return this.dispatchService.autoAssign(workOrderId);
  }

  @Get('board')
  getBoard(@CurrentCompany() company: { id: string }) {
    return this.dispatchService.getBoard(company.id);
  }
}
