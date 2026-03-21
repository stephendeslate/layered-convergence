import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        ...dto,
        skills: dto.skills || [],
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { workOrders: { where: { status: { in: ['ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS'] } } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const technician = await this.prisma.technician.findUnique({
      where: { id },
      include: { workOrders: true },
    });

    if (!technician || technician.companyId !== companyId) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    const technician = await this.findOne(companyId, id);

    return this.prisma.technician.update({
      where: { id: technician.id },
      data: dto,
    });
  }

  async findAvailable(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId, availability: 'AVAILABLE' },
      orderBy: { name: 'asc' },
    });
  }
}
