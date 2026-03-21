import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechnicianService {
  private readonly logger = new Logger(TechnicianService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: safe because we filter by both id (PK) and companyId for tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });

    if (!technician) {
      throw new NotFoundException(`Technician with ID ${id} not found`);
    }

    return technician;
  }

  async create(dto: CreateTechnicianDto, companyId: string) {
    const technician = await this.prisma.technician.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        specialties: dto.specialties,
        companyId,
      },
    });

    this.logger.log(`Technician created: ${technician.id}`);
    return technician;
  }

  async update(id: string, dto: UpdateTechnicianDto, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.technician.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.specialties !== undefined && { specialties: dto.specialties }),
      },
    });
  }
}
