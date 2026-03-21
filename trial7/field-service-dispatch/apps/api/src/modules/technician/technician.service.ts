import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills ? toJsonField(dto.skills) : undefined,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { workOrders: { where: { status: { not: 'PAID' } } } },
    });
  }

  async findOneOrThrow(companyId: string, id: string) {
    return this.prisma.technician.findFirstOrThrow({
      where: { id, companyId },
      include: { workOrders: true, routes: true },
    });
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    await this.prisma.technician.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.technician.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        skills: dto.skills ? toJsonField(dto.skills) : undefined,
        status: dto.status,
        currentLat: dto.currentLat,
        currentLng: dto.currentLng,
      },
    });
  }

  async updateLocation(id: string, lat: number, lng: number) {
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async remove(companyId: string, id: string) {
    await this.prisma.technician.findFirstOrThrow({ where: { id, companyId } });
    return this.prisma.technician.delete({ where: { id } });
  }
}
