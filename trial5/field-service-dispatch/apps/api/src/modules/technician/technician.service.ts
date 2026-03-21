import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TechnicianStatus } from '@prisma/client';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTechnicianDto) {
    return this.prisma.technician.create({ data: dto });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: {
        workOrders: {
          where: { status: { notIn: ['COMPLETED', 'INVOICED', 'PAID'] } },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.technician.findUniqueOrThrow({
      where: { id },
      include: {
        workOrders: { orderBy: { scheduledAt: 'asc' } },
        routes: { orderBy: { date: 'desc' }, take: 5 },
      },
    });
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    await this.prisma.technician.findUniqueOrThrow({ where: { id } });
    return this.prisma.technician.update({ where: { id }, data: dto });
  }

  async updatePosition(id: string, lat: number, lng: number) {
    await this.prisma.technician.findUniqueOrThrow({ where: { id } });
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async findAvailable(companyId: string, requiredSkills?: string[]) {
    const where: Record<string, unknown> = {
      companyId,
      status: TechnicianStatus.AVAILABLE,
    };

    if (requiredSkills && requiredSkills.length > 0) {
      where.skills = { hasEvery: requiredSkills };
    }

    return this.prisma.technician.findMany({ where });
  }
}
