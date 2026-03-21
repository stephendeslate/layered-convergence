import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGpsEventDto } from './dto/gps.dto';

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(companyId: string, dto: CreateGpsEventDto) {
    // Verify technician belongs to company — tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id: dto.technicianId, companyId },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    // Create GPS event record
    const event = await this.prisma.gpsEvent.create({
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        heading: dto.heading,
        speed: dto.speed,
        technicianId: dto.technicianId,
        companyId,
      },
    });

    // Also update technician's current location
    await this.prisma.technician.update({
      where: { id: dto.technicianId },
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    return event;
  }

  async findByTechnician(companyId: string, technicianId: string, limit = 50) {
    return this.prisma.gpsEvent.findMany({
      where: { companyId, technicianId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  }

  async getLatestLocations(companyId: string) {
    return this.prisma.technician.findMany({
      where: {
        companyId,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        availability: true,
      },
    });
  }
}
