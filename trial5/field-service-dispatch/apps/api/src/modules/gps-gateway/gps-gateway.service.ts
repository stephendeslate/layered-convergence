import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface GpsPosition {
  technicianId: string;
  lat: number;
  lng: number;
  timestamp: Date;
}

@Injectable()
export class GpsGatewayService {
  private readonly logger = new Logger(GpsGatewayService.name);
  private readonly positionBuffer = new Map<string, GpsPosition>();

  constructor(private readonly prisma: PrismaService) {}

  async updatePosition(position: GpsPosition) {
    this.positionBuffer.set(position.technicianId, position);

    // Persist to database
    await this.prisma.technician.update({
      where: { id: position.technicianId },
      data: {
        currentLat: position.lat,
        currentLng: position.lng,
      },
    });

    this.logger.debug(
      `GPS update: technician ${position.technicianId} at (${position.lat}, ${position.lng})`,
    );

    return position;
  }

  getLatestPosition(technicianId: string): GpsPosition | undefined {
    return this.positionBuffer.get(technicianId);
  }

  getAllPositions(companyId?: string): GpsPosition[] {
    return Array.from(this.positionBuffer.values());
  }
}
