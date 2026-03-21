import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGpsEventDto } from './dto/create-gps-event.dto';

@Injectable()
export class GpsEventService {
  private readonly logger = new Logger(GpsEventService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByTechnician(technicianId: string, companyId: string) {
    return this.prisma.gpsEvent.findMany({
      where: { technicianId, companyId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async create(dto: CreateGpsEventDto, companyId: string) {
    const gpsEvent = await this.prisma.gpsEvent.create({
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        technicianId: dto.technicianId,
        companyId,
      },
    });

    this.logger.log(`GPS event created: ${gpsEvent.id}`);
    return gpsEvent;
  }
}
