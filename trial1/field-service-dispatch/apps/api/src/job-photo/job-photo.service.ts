import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UploadPhotoDto {
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  mimeType?: string;
  sizeBytes?: number;
  latitude?: number;
  longitude?: number;
  technicianId?: string;
}

@Injectable()
export class JobPhotoService {
  private readonly logger = new Logger(JobPhotoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upload(companyId: string, workOrderId: string, dto: UploadPhotoDto) {
    // Verify work order exists
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${workOrderId} not found`);
    }

    const photo = await this.prisma.jobPhoto.create({
      data: {
        companyId,
        workOrderId,
        technicianId: dto.technicianId,
        url: dto.url,
        thumbnailUrl: dto.thumbnailUrl,
        caption: dto.caption,
        mimeType: dto.mimeType ?? 'image/jpeg',
        sizeBytes: dto.sizeBytes,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    return photo;
  }

  async list(companyId: string, workOrderId: string) {
    return this.prisma.jobPhoto.findMany({
      where: { companyId, workOrderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(companyId: string, photoId: string) {
    const photo = await this.prisma.jobPhoto.findFirst({
      where: { id: photoId, companyId },
    });

    if (!photo) {
      throw new NotFoundException(`Photo ${photoId} not found`);
    }

    await this.prisma.jobPhoto.delete({
      where: { id: photoId },
    });
  }
}
