import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AVAILABILITY_STATUSES } from '@field-service-dispatch/shared';
import type { AvailabilityStatus } from '@field-service-dispatch/shared';

// TRACED: FD-DM-TECH-001 — Technician management with availability tracking
@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.technicianProfile.findMany({
      include: { user: { select: { email: true, role: true } } },
    });
  }

  async findAvailable() {
    return this.prisma.technicianProfile.findMany({
      where: { availability: 'AVAILABLE' },
      include: { user: { select: { email: true } } },
    });
  }

  async updateAvailability(id: string, availability: AvailabilityStatus) {
    // findFirst: scoped by id, may expand to tenant scope
    const profile = await this.prisma.technicianProfile.findFirst({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Technician profile not found');
    }

    return this.prisma.technicianProfile.update({
      where: { id },
      data: { availability },
    });
  }
}
