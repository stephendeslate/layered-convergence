// [TRACED:FD-AC-006] GpsEvent CRUD with company isolation
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GpsEventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { latitude: number; longitude: number; technicianId: string; companyId: string }) {
    return this.prisma.gpsEvent.create({
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        technicianId: data.technicianId,
        companyId: data.companyId,
      },
    });
  }

  async findByTechnician(technicianId: string, companyId: string) {
    return this.prisma.gpsEvent.findMany({
      where: { technicianId, companyId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
