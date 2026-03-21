import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from './dto/technician.dto';
import { TechnicianAvailability } from '@prisma/client';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills ?? [],
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    // Always filter by companyId for tenant isolation
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { workOrders: { take: 5, orderBy: { createdAt: 'desc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(companyId: string, id: string) {
    // findFirst with companyId ensures tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
      include: { workOrders: { orderBy: { createdAt: 'desc' } } },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    await this.findById(companyId, id);

    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async updateAvailability(companyId: string, id: string, availability: TechnicianAvailability) {
    await this.findById(companyId, id);

    return this.prisma.technician.update({
      where: { id },
      data: { availability },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findById(companyId, id);

    return this.prisma.technician.delete({ where: { id } });
  }
}
