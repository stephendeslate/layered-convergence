// [TRACED:API-011] GpsEvent CRUD with company scope

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
    // findFirst justified: fetching by primary key + company scope for multi-tenant isolation
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
    eventType?: 'CHECK_IN' | 'CHECK_OUT' | 'EN_ROUTE' | 'IDLE';
    technicianId: string;
    companyId: string;
  }) {
    return this.prisma.gpsEvent.create({ data });
  }

  async findByTechnician(technicianId: string, companyId: string) {
    return this.prisma.gpsEvent.findMany({
      where: { technicianId, companyId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
