import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        ...dto,
        skills: dto.skills ?? [],
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId },
      include: { workOrders: { where: { status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] } } } },
    });
  }

  async findOne(companyId: string, id: string) {
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });
    if (!technician) throw new NotFoundException('Technician not found');
    return technician;
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    await this.findOne(companyId, id);
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.technician.delete({ where: { id } });
  }

  async findNearestAvailable(companyId: string, lat: number, lng: number, requiredSkills: string[]) {
    const technicians = await this.prisma.technician.findMany({
      where: {
        companyId,
        status: 'AVAILABLE',
        currentLat: { not: null },
        currentLng: { not: null },
      },
    });

    const matching = technicians.filter((tech) => {
      if (requiredSkills.length === 0) return true;
      return requiredSkills.every((skill) => tech.skills.includes(skill));
    });

    if (matching.length === 0) return null;

    return matching.reduce((nearest, tech) => {
      const distA = this.haversineDistance(lat, lng, nearest.currentLat!, nearest.currentLng!);
      const distB = this.haversineDistance(lat, lng, tech.currentLat!, tech.currentLng!);
      return distB < distA ? tech : nearest;
    });
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
