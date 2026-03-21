import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobPhotoDto } from './dto/create-job-photo.dto';

@Injectable()
export class JobPhotoService {
  private readonly logger = new Logger(JobPhotoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJobPhotoDto) {
    this.logger.log(`Adding photo to work order ${dto.workOrderId}`);
    return this.prisma.jobPhoto.create({ data: dto });
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.jobPhoto.findMany({
      where: { workOrderId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.jobPhoto.findUniqueOrThrow({ where: { id } });
  }

  async remove(id: string) {
    return this.prisma.jobPhoto.delete({ where: { id } });
  }
}
