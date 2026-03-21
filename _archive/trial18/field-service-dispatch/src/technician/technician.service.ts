import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTechnicianDto } from './dto/create-technician.dto.js';
import { UpdateTechnicianDto } from './dto/update-technician.dto.js';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTechnicianDto) {
    return this.prisma.technician.create({ data: dto });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.technician.findMany({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: scoping by both id and companyId for tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });
    if (!technician) {
      throw new NotFoundException(`Technician ${id} not found`);
    }
    return technician;
  }

  async update(id: string, companyId: string, dto: UpdateTechnicianDto) {
    await this.findOne(id, companyId);
    return this.prisma.technician.update({ where: { id }, data: dto });
  }

  async updatePosition(id: string, companyId: string, lat: number, lng: number) {
    await this.findOne(id, companyId);
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.technician.delete({ where: { id } });
  }
}
