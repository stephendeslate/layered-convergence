import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLocation(
    companyId: string,
    technicianId: string,
    lat: number,
    lng: number,
  ) {
    return this.prisma.technician.updateMany({
      where: { id: technicianId, companyId },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async getLocations(companyId: string) {
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

  async getTechnicianLocation(companyId: string, technicianId: string) {
    return this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        status: true,
      },
    });
  }

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
