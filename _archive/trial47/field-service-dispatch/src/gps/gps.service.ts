import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GpsPositionDto } from './dto/gps-position.dto';

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordPosition(companyId: string, dto: GpsPositionDto) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: dto.technicianId, companyId },
    });
    if (!technician) throw new NotFoundException('Technician not found');

    const [gpsEvent] = await Promise.all([
      this.prisma.gpsEvent.create({
        data: {
          technicianId: dto.technicianId,
          lat: dto.lat,
          lng: dto.lng,
          accuracy: dto.accuracy,
        },
      }),
      this.prisma.technician.update({
        where: { id: dto.technicianId },
        data: { currentLat: dto.lat, currentLng: dto.lng },
      }),
    ]);

    return gpsEvent;
  }

  async getHistory(companyId: string, technicianId: string, limit = 50) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
    });
    if (!technician) throw new NotFoundException('Technician not found');

    return this.prisma.gpsEvent.findMany({
      where: { technicianId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getLatestPositions(companyId: string) {
    const technicians = await this.prisma.technician.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        status: true,
      },
    });

    return technicians.filter((t) => t.currentLat !== null && t.currentLng !== null);
  }
}
