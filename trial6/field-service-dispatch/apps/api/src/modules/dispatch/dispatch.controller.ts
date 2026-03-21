import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { AutoAssignDto, DispatchQueryDto } from './dto/auto-assign.dto';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('auto-assign')
  autoAssign(@Body() dto: AutoAssignDto) {
    return this.dispatchService.autoAssign(dto.workOrderId);
  }

  @Get('board')
  getBoard(@Query() query: DispatchQueryDto) {
    return this.dispatchService.getDispatchBoard(query.companyId);
  }
}
