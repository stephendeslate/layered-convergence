import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GpsPosition {
  technicianId: string;
  lat: number;
  lng: number;
  accuracy?: number;
}

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordPosition(position: GpsPosition) {
    const [gpsEvent] = await Promise.all([
      this.prisma.gpsEvent.create({
        data: {
          technicianId: position.technicianId,
          lat: position.lat,
          lng: position.lng,
          accuracy: position.accuracy,
        },
      }),
      this.prisma.technician.update({
        where: { id: position.technicianId },
        data: {
          currentLat: position.lat,
          currentLng: position.lng,
        },
      }),
    ]);
    return gpsEvent;
  }

  async getHistory(technicianId: string, since?: Date) {
    return this.prisma.gpsEvent.findMany({
      where: {
        technicianId,
        ...(since ? { timestamp: { gte: since } } : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async getLatestPositions(companyId: string) {
    const technicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        currentLat: { not: null },
        currentLng: { not: null },
      },
      select: {
        id: true,
        name: true,
        status: true,
        currentLat: true,
        currentLng: true,
      },
    });
    return technicians;
  }
}
