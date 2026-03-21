import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyContext: CompanyContextService,
  ) {}

  async findAll(companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
      include: { user: { select: { email: true } } },
    });
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    return technician;
  }

  async create(dto: CreateTechnicianDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.technician.create({
      data: {
        userId: dto.userId,
        skills: dto.skills,
        availability: dto.availability,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateTechnicianDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    return this.prisma.technician.delete({ where: { id } });
  }
}
