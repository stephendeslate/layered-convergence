import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTechnicianDto, UpdateTechnicianDto, UpdateLocationDto } from './technician.dto';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills ?? [],
      },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: {
        _count: { select: { workOrders: true } },
      },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.technician.findFirstOrThrow({
      where: { id, companyId },
      include: {
        workOrders: {
          where: { status: { not: 'PAID' } },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });
  }

  async findAvailable(companyId: string, skills?: string[]) {
    const where: Record<string, unknown> = {
      companyId,
      status: 'AVAILABLE',
    };

    if (skills && skills.length > 0) {
      where.skills = { hasSome: skills };
    }

    return this.prisma.technician.findMany({ where });
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    await this.prisma.technician.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async updateLocation(companyId: string, id: string, dto: UpdateLocationDto) {
    await this.prisma.technician.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.technician.update({
      where: { id },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
      },
    });
  }

  async delete(companyId: string, id: string) {
    await this.prisma.technician.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.technician.delete({ where: { id } });
  }
}
