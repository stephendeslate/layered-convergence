import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JobPhotoService } from './job-photo.service';
import { CreateJobPhotoDto } from './dto/create-job-photo.dto';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobPhotoService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobPhotoService.remove(id);
  }
}
