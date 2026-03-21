import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
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
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills,
        currentLat: dto.currentLat,
        currentLng: dto.currentLng,
        status: dto.status,
      },
    });
  }

  async delete(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.technician.delete({ where: { id } });
  }

  async findAvailable(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId, status: 'AVAILABLE' },
    });
  }

  async findNearest(companyId: string, lat: number, lng: number) {
    const available = await this.findAvailable(companyId);
    if (available.length === 0) return null;

    let nearest = available[0];
    let minDist = Infinity;

    for (const tech of available) {
      if (tech.currentLat !== null && tech.currentLng !== null) {
        const dist = Math.sqrt(
          Math.pow(tech.currentLat - lat, 2) +
            Math.pow(tech.currentLng - lng, 2),
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = tech;
        }
      }
    }

    return nearest;
  }
}
