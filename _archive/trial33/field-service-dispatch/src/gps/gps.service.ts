import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GpsPosition {
  technicianId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async updatePosition(position: GpsPosition) {
    const updated = await this.prisma.technician.update({
      where: { id: position.technicianId },
      data: {
        currentLat: position.lat,
        currentLng: position.lng,
      },
    });

    await this.prisma.gpsEvent.create({
      data: {
        technicianId: position.technicianId,
        lat: position.lat,
        lng: position.lng,
      },
    });

    return updated;
  }

  async getPosition(technicianId: string) {
    const technician = await this.prisma.technician.findUnique({
      where: { id: technicianId },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        companyId: true,
      },
    });
    return technician;
  }

  async getCompanyPositions(companyId: string) {
    return this.prisma.technician.findMany({
      where: {
        companyId,
        status: { not: 'OFF_DUTY' },
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
