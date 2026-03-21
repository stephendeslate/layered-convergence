import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { AutoDispatchDto } from './dto/auto-dispatch.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('dispatch')
@UseGuards(CompanyGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('auto')
  autoDispatch(
    @CurrentCompany() company: { id: string },
    @Body() dto: AutoDispatchDto,
  ) {
    return this.dispatchService.autoDispatch(
      company.id,
      dto.workOrderId,
      dto.requiredSkills,
    );
  }
}
