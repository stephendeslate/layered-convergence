import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class TechnicianService {
  private readonly logger = new Logger(TechnicianService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    this.logger.log(`Creating technician: ${dto.name} for company ${companyId}`);
    return this.prisma.technician.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills ? toJsonValue(dto.skills) : undefined,
      },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: {
        _count: { select: { workOrders: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.technician.findUniqueOrThrow({
      where: { id },
      include: {
        workOrders: {
          where: { status: { notIn: ['completed', 'invoiced', 'paid'] } },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.skills !== undefined) data.skills = toJsonValue(dto.skills);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.currentLat !== undefined) data.currentLat = dto.currentLat;
    if (dto.currentLng !== undefined) data.currentLng = dto.currentLng;

    return this.prisma.technician.update({ where: { id }, data });
  }

  async updatePosition(id: string, lat: number, lng: number) {
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: lat, currentLng: lng },
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
      const skills = (tech.skills as string[]) ?? [];
      return requiredSkills.every((skill) => skills.includes(skill));
    });
  }

  async remove(id: string) {
    return this.prisma.technician.delete({ where: { id } });
  }
}
