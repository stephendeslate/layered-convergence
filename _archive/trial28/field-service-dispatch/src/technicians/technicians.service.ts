import { Injectable, NotFoundException } from '@nestjs/common';
import { TechnicianStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills || [],
        currentLat: dto.currentLat,
        currentLng: dto.currentLng,
      },
    });
  }

  async findAll(companyId: string, status?: TechnicianStatus) {
    return this.prisma.technician.findMany({
      where: { companyId, ...(status && { status }) },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
      include: { workOrders: { where: { status: { not: 'PAID' } } } },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${id} not found`);
    }

    return technician;
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    await this.findOne(companyId, id);
    return this.prisma.technician.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        skills: dto.skills,
        currentLat: dto.currentLat,
        currentLng: dto.currentLng,
        status: dto.status,
      },
    });
  }

  async updateLocation(
    companyId: string,
    id: string,
    lat: number,
    lng: number,
  ) {
    await this.findOne(companyId, id);
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async delete(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.technician.delete({ where: { id } });
  }
}
