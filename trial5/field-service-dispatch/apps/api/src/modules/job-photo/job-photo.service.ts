import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';

@Injectable()
export class JobPhotoService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(dto: UploadPhotoDto) {
    await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: dto.workOrderId },
    });

    return this.prisma.jobPhoto.create({
      data: {
        workOrderId: dto.workOrderId,
        url: dto.url,
        caption: dto.caption,
      },
    });
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.jobPhoto.findMany({
      where: { workOrderId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async delete(id: string) {
    await this.prisma.jobPhoto.findUniqueOrThrow({ where: { id } });
    return this.prisma.jobPhoto.delete({ where: { id } });
  }
}
