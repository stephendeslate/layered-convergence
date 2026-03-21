import { Module } from '@nestjs/common';
import { JobPhotoController } from './job-photo.controller';
import { JobPhotoService } from './job-photo.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [JobPhotoController],
  providers: [JobPhotoService, PrismaService],
  exports: [JobPhotoService],
})
export class JobPhotoModule {}
