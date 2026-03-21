import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(companyId: string, dto: CreateGpsEventDto) {
    const technician = await this.prisma.technician.findUnique({
      where: { id: dto.technicianId },
    });

    if (!technician || technician.companyId !== companyId) {
      throw new NotFoundException('Technician not found');
    }

    const [gpsEvent] = await this.prisma.$transaction([
      this.prisma.gpsEvent.create({
        data: {
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy,
          heading: dto.heading,
          speed: dto.speed,
          companyId,
          technicianId: dto.technicianId,
        },
      }),
      this.prisma.technician.update({
        where: { id: dto.technicianId },
        data: {
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      }),
    ]);

    return gpsEvent;
  }

  async findByTechnician(companyId: string, technicianId: string, limit = 100) {
    return this.prisma.gpsEvent.findMany({
      where: { companyId, technicianId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  }

  async getLatestPositions(companyId: string) {
    const technicians = await this.prisma.technician.findMany({
      where: { companyId, latitude: { not: null }, longitude: { not: null } },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        availability: true,
      },
    });

    return technicians;
  }
}
