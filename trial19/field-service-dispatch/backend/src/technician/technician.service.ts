import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, companyId: string) {
    // findFirst justified: filtering by both id AND companyId for tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    return technician;
  }

  async create(dto: CreateTechnicianDto, companyId: string) {
    return this.prisma.technician.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills,
        availability: dto.availability,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateTechnicianDto, companyId: string) {
    await this.findById(id, companyId);
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }
}
