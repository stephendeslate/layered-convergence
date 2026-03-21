import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PositionUpdateDto } from './dto/position-update.dto';

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async updatePosition(dto: PositionUpdateDto) {
    const technician = await this.prisma.technician.update({
      where: { id: dto.technicianId },
      data: { currentLat: dto.lat, currentLng: dto.lng },
    });

    return {
      technicianId: technician.id,
      lat: technician.currentLat,
      lng: technician.currentLng,
      timestamp: new Date().toISOString(),
    };
  }

  async getPositions(companyId: string) {
    return this.prisma.technician.findMany({
      where: {
        companyId,
        currentLat: { not: null },
        currentLng: { not: null },
      },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        status: true,
      },
    });
  }
}
