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
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: scoped by companyId for tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });

    if (!technician) {
      throw new NotFoundException(`Technician with id ${id} not found`);
    }

    return technician;
  }

  async update(id: string, companyId: string, dto: UpdateTechnicianDto) {
    await this.findOne(id, companyId);
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.technician.delete({
      where: { id },
    });
  }

  async findAvailable(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId, availability: 'AVAILABLE' },
    });
  }

  async updateLocation(id: string, companyId: string, lat: number, lng: number) {
    await this.findOne(id, companyId);
    return this.prisma.technician.update({
      where: { id },
      data: { lat, lng },
    });
  }
}
