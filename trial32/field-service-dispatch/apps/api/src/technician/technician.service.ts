// [TRACED:FD-AC-004] Technician CRUD with company isolation
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; specialty: string; companyId: string }) {
    return this.prisma.technician.create({ data });
  }

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: querying by id + companyId for company isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async updateAvailability(id: string, companyId: string, isAvailable: boolean) {
    await this.findOne(id, companyId);
    return this.prisma.technician.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.technician.delete({ where: { id } });
  }
}
