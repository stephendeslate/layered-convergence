import { Module } from '@nestjs/common';
import { JobPhotoService } from './job-photo.service';
import { JobPhotoController } from './job-photo.controller';

@Module({
  controllers: [JobPhotoController],
  providers: [JobPhotoService],
  exports: [JobPhotoService],
})
export class JobPhotoModule {}
