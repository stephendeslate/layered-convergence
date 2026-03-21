import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';

// [TRACED:PV-004] GPS event tracking for real-time technician location
@Injectable()
export class GpsEventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyContext: CompanyContextService,
  ) {}

  async findAll(companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.gpsEvent.findMany({
      where: { companyId },
      include: {
        technician: {
          select: { user: { select: { email: true } } },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async findByTechnician(technicianId: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.gpsEvent.findMany({
      where: { technicianId, companyId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }

  async create(dto: CreateGpsEventDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.gpsEvent.create({
      data: {
        technicianId: dto.technicianId,
        lat: dto.lat,
        lng: dto.lng,
        companyId,
      },
    });
  }
}
