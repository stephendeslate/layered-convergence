import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { AutoAssignDto } from './dispatch.dto';
import { CompanyGuard } from '../../common/guards/company.guard';

@Controller('dispatch')
@UseGuards(CompanyGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('auto-assign')
  autoAssign(@Body() dto: AutoAssignDto) {
    return this.dispatchService.autoAssign(dto.workOrderId, dto.requiredSkills);
  }
}
