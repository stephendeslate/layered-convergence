import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GpsEventService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.gpsEvent.findMany({
      where: { companyId },
      include: { technician: true },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: fetching by primary key + company scope for RLS verification
    const gpsEvent = await this.prisma.gpsEvent.findFirst({
      where: { id, companyId },
      include: { technician: true },
    });

    if (!gpsEvent) {
      throw new NotFoundException('GPS event not found');
    }

    return gpsEvent;
  }

  async create(data: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    technicianId: string;
    companyId: string;
  }) {
    return this.prisma.gpsEvent.create({ data });
  }
}
