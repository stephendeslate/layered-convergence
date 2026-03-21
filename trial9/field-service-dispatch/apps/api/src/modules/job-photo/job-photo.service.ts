import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateJobPhotoDto } from './job-photo.dto';

@Injectable()
export class JobPhotoService {
  private readonly logger = new Logger(JobPhotoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJobPhotoDto) {
    const photo = await this.prisma.jobPhoto.create({ data: dto });
    this.logger.log(`Job photo uploaded: ${photo.id} for work order ${dto.workOrderId}`);
    return photo;
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.jobPhoto.findMany({
      where: { workOrderId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async delete(id: string) {
    return this.prisma.jobPhoto.delete({ where: { id } });
  }
}
