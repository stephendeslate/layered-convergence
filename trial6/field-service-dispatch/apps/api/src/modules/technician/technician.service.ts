import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTechnicianDto, UpdateTechnicianDto, TechnicianLocationDto } from './dto/create-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTechnicianDto) {
    return this.prisma.technician.create({ data: dto });
  }

  async findByCompany(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { workOrders: { where: { status: { not: 'COMPLETED' } } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.technician.findFirstOrThrow({
      where: { id },
      include: { workOrders: true, routes: true },
    });
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    return this.prisma.technician.update({ where: { id }, data: dto });
  }

  async updateLocation(id: string, dto: TechnicianLocationDto) {
    return this.prisma.technician.update({
      where: { id },
      data: { currentLat: dto.lat, currentLng: dto.lng },
    });
  }

  async remove(id: string) {
    return this.prisma.technician.delete({ where: { id } });
  }
}
