import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface EtaResult {
  workOrderId: string;
  etaMinutes: number;
  distanceMeters: number;
}

@Injectable()
export class EtaService {
  private readonly logger = new Logger(EtaService.name);

  constructor(private prisma: PrismaService) {}

  async calculateEta(workOrderId: string, companyId: string): Promise<EtaResult> {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId },
      include: { technician: true },
    });

    if (!workOrder.technician) {
      return {
        workOrderId,
        etaMinutes: -1,
        distanceMeters: 0,
      };
    }

    const techLat = workOrder.technician.currentLat;
    const techLng = workOrder.technician.currentLng;

    if (techLat === null || techLng === null) {
      return {
        workOrderId,
        etaMinutes: -1,
        distanceMeters: 0,
      };
    }

    const distanceMeters = this.haversineDistance(
      techLat,
      techLng,
      workOrder.lat,
      workOrder.lng,
    );

    const avgSpeedMps = 10; // ~22 mph in urban areas
    const etaSeconds = distanceMeters / avgSpeedMps;
    const etaMinutes = Math.ceil(etaSeconds / 60);

    return {
      workOrderId,
      etaMinutes,
      distanceMeters: Math.round(distanceMeters),
    };
  }

  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371000;
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
    return (deg * Math.PI) / 180;
  }
}
