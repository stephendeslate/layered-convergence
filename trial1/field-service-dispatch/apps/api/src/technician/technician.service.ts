import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface CreateTechnicianDto {
  userId: string;
  skills: string[];
  maxJobsPerDay?: number;
  vehicleInfo?: string;
  color?: string;
}

export interface UpdateTechnicianDto {
  skills?: string[];
  maxJobsPerDay?: number;
  vehicleInfo?: string;
  color?: string;
  status?: string;
}

export interface TechnicianListQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  skills?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class TechnicianService {
  private readonly logger = new Logger(TechnicianService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(companyId: string, dto: CreateTechnicianDto, userId?: string) {
    // Verify user exists and belongs to company
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, companyId },
    });

    if (!user) {
      throw new BadRequestException('User not found in this company');
    }

    // Check if technician profile already exists for this user
    const existing = await this.prisma.technician.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new BadRequestException('Technician profile already exists for this user');
    }

    const technician = await this.prisma.technician.create({
      data: {
        companyId,
        userId: dto.userId,
        skills: dto.skills as any[],
        maxJobsPerDay: dto.maxJobsPerDay ?? 8,
        vehicleInfo: dto.vehicleInfo,
        color: dto.color ?? '#3B82F6',
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'technician.create',
      entityType: 'Technician',
      entityId: technician.id,
      metadata: { skills: dto.skills },
    });

    return technician;
  }

  async update(companyId: string, technicianId: string, dto: UpdateTechnicianDto, userId?: string) {
    const technician = await this.getOrThrow(companyId, technicianId);

    const data: any = {};
    if (dto.skills) data.skills = dto.skills;
    if (dto.maxJobsPerDay !== undefined) data.maxJobsPerDay = dto.maxJobsPerDay;
    if (dto.vehicleInfo !== undefined) data.vehicleInfo = dto.vehicleInfo;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.status) data.status = dto.status;

    const updated = await this.prisma.technician.update({
      where: { id: technicianId },
      data,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'technician.update',
      entityType: 'Technician',
      entityId: technicianId,
      metadata: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  async get(companyId: string, technicianId: string) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${technicianId} not found`);
    }

    return technician;
  }

  async list(companyId: string, query: TechnicianListQuery) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (query.status) where.status = query.status;
    if (query.skills) {
      where.skills = { hasSome: query.skills.split(',') };
    }

    const orderBy: any = {};
    orderBy[query.sortBy ?? 'createdAt'] = query.sortOrder ?? 'desc';

    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.technician.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getSchedule(companyId: string, technicianId: string, date: string) {
    await this.getOrThrow(companyId, technicianId);

    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(`${date}T23:59:59Z`);

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        companyId,
        technicianId,
        scheduledStart: { gte: dayStart, lte: dayEnd },
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        customer: true,
      },
      orderBy: { scheduledStart: 'asc' },
    });

    return {
      technicianId,
      date,
      workOrders,
    };
  }

  async updatePosition(
    technicianId: string,
    latitude: number,
    longitude: number,
  ) {
    await this.prisma.technician.update({
      where: { id: technicianId },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastPositionAt: new Date(),
      },
    });
  }

  /**
   * Find nearest available technicians with optional skill filter.
   * Uses Haversine formula for distance calculation.
   */
  async getNearby(
    companyId: string,
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    skills?: string[],
  ) {
    // Fetch all available technicians with GPS positions
    const where: any = {
      companyId,
      status: { in: ['AVAILABLE', 'ON_BREAK'] },
      currentLatitude: { not: null },
      currentLongitude: { not: null },
    };

    if (skills && skills.length > 0) {
      where.skills = { hasSome: skills };
    }

    const technicians = await this.prisma.technician.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });

    // Calculate distances and filter by radius
    const radiusMeters = radiusKm * 1000;
    const results = technicians
      .map((tech) => {
        const distance = haversineDistance(
          latitude,
          longitude,
          Number(tech.currentLatitude),
          Number(tech.currentLongitude),
        );
        return { ...tech, distanceMeters: Math.round(distance) };
      })
      .filter((tech) => tech.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return results;
  }

  async delete(companyId: string, technicianId: string, userId?: string) {
    await this.getOrThrow(companyId, technicianId);

    await this.prisma.technician.delete({
      where: { id: technicianId },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'technician.delete',
      entityType: 'Technician',
      entityId: technicianId,
    });
  }

  private async getOrThrow(companyId: string, technicianId: string) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${technicianId} not found`);
    }

    return technician;
  }
}

// Haversine distance in meters
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
