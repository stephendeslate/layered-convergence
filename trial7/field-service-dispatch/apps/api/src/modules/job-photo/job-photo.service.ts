import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateJobPhotoDto } from './dto/create-job-photo.dto';

@Injectable()
export class JobPhotoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJobPhotoDto) {
    return this.prisma.jobPhoto.create({ data: dto });
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.jobPhoto.findMany({
      where: { workOrderId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.jobPhoto.findFirstOrThrow({ where: { id } });
  }

  async remove(id: string) {
    await this.prisma.jobPhoto.findFirstOrThrow({ where: { id } });
    return this.prisma.jobPhoto.delete({ where: { id } });
  }
}
