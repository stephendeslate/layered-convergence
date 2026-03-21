import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto, UpdateTechnicianLocationDto } from './dto/update-technician.dto';

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills,
        hourlyRate: dto.hourlyRate,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.technician.findUnique({ where: { id } });
  }

  async findByIdAndCompany(id: string, companyId: string) {
    return this.prisma.technician.findFirstOrThrow({
      where: { id, companyId },
      include: { workOrders: { where: { status: { not: 'PAID' } } } },
    });
  }

  async update(id: string, companyId: string, dto: UpdateTechnicianDto) {
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async updateLocation(id: string, dto: UpdateTechnicianLocationDto) {
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: dto.lat, currentLng: dto.lng },
    });
  }

  async findAvailable(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId, status: 'AVAILABLE', isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findNearest(companyId: string, lat: number, lng: number, skills?: string[], radiusMeters: number = 50000) {
    const skillFilter = skills && skills.length > 0
      ? `AND t.skills @> ARRAY[${skills.map((_, i) => `$${i + 4}`).join(',')}]::text[]`
      : '';

    const technicians = await this.prisma.$queryRaw<
      Array<{ id: string; name: string; skills: string[]; distance_meters: number; currentLat: number; currentLng: number }>
    >`
      SELECT
        t.id,
        t.name,
        t.skills,
        t."currentLat",
        t."currentLng",
        (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(t."currentLat")) *
            cos(radians(t."currentLng") - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(t."currentLat"))
          )
        ) as distance_meters
      FROM technicians t
      WHERE t."companyId" = ${companyId}::uuid
        AND t.status = 'AVAILABLE'
        AND t."isActive" = true
        AND t."currentLat" IS NOT NULL
        AND t."currentLng" IS NOT NULL
      ORDER BY distance_meters ASC
      LIMIT 10
    `;

    return { technicians: technicians.filter(t => t.distance_meters <= radiusMeters) };
  }

  async getWorkOrders(technicianId: string, companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { technicianId, companyId },
      include: { customer: { select: { name: true, address: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
