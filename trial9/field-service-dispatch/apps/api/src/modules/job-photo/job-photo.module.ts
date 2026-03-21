import { Module } from '@nestjs/common';
import { JobPhotoService } from './job-photo.service';
import { JobPhotoController } from './job-photo.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [JobPhotoController],
  providers: [JobPhotoService, PrismaService],
  exports: [JobPhotoService],
})
export class JobPhotoModule {}
