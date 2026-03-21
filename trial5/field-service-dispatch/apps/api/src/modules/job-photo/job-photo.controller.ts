import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { JobPhotoService } from './job-photo.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';

@Controller('job-photos')
export class JobPhotoController {
  constructor(private readonly jobPhotoService: JobPhotoService) {}

  @Post()
  upload(@Body() dto: UploadPhotoDto) {
    return this.jobPhotoService.upload(dto);
  }

  @Get()
  findByWorkOrder(@Query('workOrderId') workOrderId: string) {
    return this.jobPhotoService.findByWorkOrder(workOrderId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.jobPhotoService.delete(id);
  }
}
