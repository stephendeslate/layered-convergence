import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';

@Injectable()
export class JobPhotoService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(dto: UploadPhotoDto) {
    return this.prisma.jobPhoto.create({ data: dto });
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.jobPhoto.findMany({
      where: { workOrderId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.jobPhoto.delete({ where: { id } });
  }
}
