import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { AutoAssignDto } from './dto/auto-assign.dto';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('auto-assign')
  autoAssign(@Body() dto: AutoAssignDto) {
    return this.dispatchService.autoAssign(dto);
  }

  @Get('board')
  getDispatchBoard(@Query('companyId') companyId: string) {
    return this.dispatchService.getDispatchBoard(companyId);
  }
}
