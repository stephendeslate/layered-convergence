import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GpsTrackingService {
  private readonly logger = new Logger(GpsTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async updatePosition(technicianId: string, lat: number, lng: number) {
    this.logger.debug(`Position update: technician ${technicianId} at ${lat}, ${lng}`);
    return this.prisma.technician.update({
      where: { id: technicianId },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async getAllPositions(companyId: string) {
    return this.prisma.technician.findMany({
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
        skills: true,
      },
    });
  }

  async getEta(technicianId: string, destLat: number, destLng: number): Promise<{
    distanceKm: number;
    estimatedMinutes: number;
  }> {
    const technician = await this.prisma.technician.findUniqueOrThrow({
      where: { id: technicianId },
    });

    if (technician.currentLat === null || technician.currentLng === null) {
      return { distanceKm: 0, estimatedMinutes: 0 };
    }

    const dist = this.haversineDistance(
      technician.currentLat, technician.currentLng,
      destLat, destLng,
    );

    // Estimate at 40 km/h average speed
    const minutes = Math.round((dist / 40) * 60);

    return { distanceKm: Math.round(dist * 10) / 10, estimatedMinutes: minutes };
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
