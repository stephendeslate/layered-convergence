import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTechnicianDto, UpdateTechnicianDto, UpdateLocationDto } from './technician.dto';

@Injectable()
export class TechnicianService {
  private readonly logger = new Logger(TechnicianService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    const technician = await this.prisma.technician.create({
      data: { ...dto, companyId, skills: dto.skills ?? [] },
    });
    this.logger.log(`Technician created: ${technician.id} for company ${companyId}`);
    return technician;
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { _count: { select: { workOrders: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.technician.findUniqueOrThrow({
      where: { id },
      include: { workOrders: { where: { status: { not: 'paid' } }, take: 10 } },
    });
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    return this.prisma.technician.update({ where: { id }, data: dto });
  }

  async updateLocation(id: string, dto: UpdateLocationDto) {
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: dto.lat, currentLng: dto.lng },
    });
  }

  async findAvailable(companyId: string, requiredSkills?: string[]) {
    const technicians = await this.prisma.technician.findMany({
      where: { companyId, status: 'available' },
    });

    if (!requiredSkills || requiredSkills.length === 0) {
      return technicians;
    }

    return technicians.filter((tech) => {
      const skills = tech.skills as string[];
      return requiredSkills.every((skill) => skills.includes(skill));
    });
  }

  async delete(id: string) {
    return this.prisma.technician.delete({ where: { id } });
  }
}
