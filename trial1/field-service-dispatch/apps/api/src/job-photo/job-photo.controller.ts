import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { JobPhotoService, UploadPhotoDto } from './job-photo.service';
import { CurrentCompany, Roles } from '../common/decorators';

@Controller('work-orders/:workOrderId/photos')
export class JobPhotoController {
  constructor(private readonly jobPhotoService: JobPhotoService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async upload(
    @CurrentCompany() companyId: string,
    @Param('workOrderId') workOrderId: string,
    @Body() dto: UploadPhotoDto,
  ) {
    return this.jobPhotoService.upload(companyId, workOrderId, dto);
  }

  @Get()
  async list(
    @CurrentCompany() companyId: string,
    @Param('workOrderId') workOrderId: string,
  ) {
    return this.jobPhotoService.list(companyId, workOrderId);
  }

  @Delete(':photoId')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async delete(
    @CurrentCompany() companyId: string,
    @Param('photoId') photoId: string,
  ) {
    await this.jobPhotoService.delete(companyId, photoId);
    return { message: 'Photo deleted' };
  }
}
