import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { JobPhotoService } from './job-photo.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';

@Controller('photos')
export class JobPhotoController {
  constructor(private readonly jobPhotoService: JobPhotoService) {}

  @Post()
  upload(@Body() dto: UploadPhotoDto) {
    return this.jobPhotoService.upload(dto);
  }

  @Get('work-order/:workOrderId')
  findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    return this.jobPhotoService.findByWorkOrder(workOrderId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobPhotoService.remove(id);
  }
}
