import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTechnicianDto, UpdateLocationDto } from './dto/create-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: { ...dto, companyId },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { workOrders: { where: { status: { not: 'completed' } } } },
    });
  }

  async findOne(id: string, companyId: string) {
    return this.prisma.technician.findUniqueOrThrow({
      where: { id, companyId },
      include: { workOrders: true, routes: true },
    });
  }

  async update(id: string, companyId: string, data: Partial<CreateTechnicianDto>) {
    return this.prisma.technician.update({
      where: { id, companyId },
      data,
    });
  }

  async updateLocation(id: string, dto: UpdateLocationDto) {
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: dto.lat, currentLng: dto.lng },
    });
  }

  async setStatus(id: string, status: string) {
    return this.prisma.technician.update({
      where: { id },
      data: { status },
    });
  }

  async findAvailable(companyId: string, requiredSkills?: string[]) {
    const technicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        status: { in: ['online'] },
      },
    });

    if (!requiredSkills || requiredSkills.length === 0) {
      return technicians;
    }

    return technicians.filter((tech) =>
      requiredSkills.every((skill) => tech.skills.includes(skill)),
    );
  }

  async remove(id: string, companyId: string) {
    return this.prisma.technician.delete({ where: { id, companyId } });
  }
}
