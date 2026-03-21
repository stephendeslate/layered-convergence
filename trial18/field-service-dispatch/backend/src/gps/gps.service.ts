import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTechnician(technicianId: string, companyId: string) {
    return this.prisma.gpsEvent.findMany({
      where: { technicianId, companyId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async create(dto: CreateGpsEventDto, companyId: string) {
    return this.prisma.gpsEvent.create({
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        timestamp: new Date(dto.timestamp),
        technicianId: dto.technicianId,
        companyId,
      },
    });
  }
}
