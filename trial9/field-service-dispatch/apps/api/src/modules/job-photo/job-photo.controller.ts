import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JobPhotoService } from './job-photo.service';
import { CreateJobPhotoDto } from './job-photo.dto';
import { CompanyGuard } from '../../common/guards/company.guard';

@Controller('job-photos')
@UseGuards(CompanyGuard)
export class JobPhotoController {
  constructor(private readonly jobPhotoService: JobPhotoService) {}

  @Post()
  create(@Body() dto: CreateJobPhotoDto) {
    return this.jobPhotoService.create(dto);
  }

  @Get('work-order/:workOrderId')
  findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    return this.jobPhotoService.findByWorkOrder(workOrderId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.jobPhotoService.delete(id);
  }
}
