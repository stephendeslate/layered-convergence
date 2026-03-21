import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTechnicianDto } from './dto/create-technician.dto.js';
import { UpdateTechnicianDto, UpdateGpsDto } from './dto/update-technician.dto.js';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: { ...dto, companyId },
    });
  }

  findAll(companyId: string) {
    return this.prisma.technician.findMany({ where: { companyId } });
  }

  findOne(companyId: string, id: string) {
    return this.prisma.technician.findFirstOrThrow({
      where: { id, companyId },
    });
  }

  update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    return this.prisma.technician.updateMany({
      where: { id, companyId },
      data: dto,
    }).then(() => this.prisma.technician.findUniqueOrThrow({ where: { id } }));
  }

  updateGps(companyId: string, id: string, dto: UpdateGpsDto) {
    return this.prisma.technician.updateMany({
      where: { id, companyId },
      data: { currentLat: dto.lat, currentLng: dto.lng },
    }).then(() => this.prisma.technician.findUniqueOrThrow({ where: { id } }));
  }

  remove(companyId: string, id: string) {
    return this.prisma.technician.deleteMany({ where: { id, companyId } });
  }
}
