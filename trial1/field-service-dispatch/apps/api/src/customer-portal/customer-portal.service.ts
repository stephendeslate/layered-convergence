import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuid } from 'uuid';

export interface TrackingData {
  workOrderId: string;
  status: string;
  serviceType: string;
  address: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  technicianName: string | null;
  technicianLatitude: number | null;
  technicianLongitude: number | null;
  companyName: string;
  companyLogoUrl: string | null;
  companyPhone: string | null;
  estimatedArrival: Date | null;
  statusHistory: Array<{
    fromStatus: string | null;
    toStatus: string;
    createdAt: Date;
    notes: string | null;
  }>;
}

export interface GenerateTokenDto {
  workOrderId: string;
  expiryHours?: number;
}

export interface MagicLinkDto {
  customerId: string;
  expiryHours?: number;
}

@Injectable()
export class CustomerPortalService {
  private readonly logger = new Logger(CustomerPortalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a tracking token for a work order.
   * Token is a UUID with configurable expiry (default 24h).
   */
  async generateTrackingToken(
    companyId: string,
    dto: GenerateTokenDto,
  ): Promise<{ token: string; expiresAt: Date }> {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${dto.workOrderId} not found`);
    }

    const token = uuid();
    const expiryHours = dto.expiryHours ?? 24;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: {
        trackingToken: token,
        trackingExpiresAt: expiresAt,
      },
    });

    this.logger.log(
      `Tracking token generated for WO ${dto.workOrderId}, expires ${expiresAt.toISOString()}`,
    );

    return { token, expiresAt };
  }

  /**
   * Public endpoint: get work order tracking data via token.
   * No auth required. Bypasses RLS via tracking token.
   */
  async getTrackingData(token: string): Promise<TrackingData> {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: {
        trackingToken: token,
        trackingExpiresAt: { gt: new Date() },
      },
      include: {
        technician: {
          select: {
            id: true,
            currentLatitude: true,
            currentLongitude: true,
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        company: {
          select: { name: true, logoUrl: true, phone: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            fromStatus: true,
            toStatus: true,
            createdAt: true,
            notes: true,
          },
        },
        routeStops: {
          select: {
            estimatedArrival: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Tracking link expired or not found');
    }

    // Find the route stop for this work order to get ETA
    const estimatedArrival =
      workOrder.routeStops.length > 0
        ? workOrder.routeStops[0].estimatedArrival
        : null;

    return {
      workOrderId: workOrder.id,
      status: workOrder.status,
      serviceType: workOrder.serviceType,
      address: workOrder.address,
      scheduledStart: workOrder.scheduledStart,
      scheduledEnd: workOrder.scheduledEnd,
      technicianName: workOrder.technician
        ? `${workOrder.technician.user.firstName} ${workOrder.technician.user.lastName}`
        : null,
      technicianLatitude: workOrder.technician?.currentLatitude
        ? Number(workOrder.technician.currentLatitude)
        : null,
      technicianLongitude: workOrder.technician?.currentLongitude
        ? Number(workOrder.technician.currentLongitude)
        : null,
      companyName: workOrder.company.name,
      companyLogoUrl: workOrder.company.logoUrl,
      companyPhone: workOrder.company.phone,
      estimatedArrival,
      statusHistory: workOrder.statusHistory.map((h) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        createdAt: h.createdAt,
        notes: h.notes,
      })),
    };
  }

  /**
   * Generate a magic link for a customer to access their portal.
   */
  async generateMagicLink(
    companyId: string,
    dto: MagicLinkDto,
  ): Promise<{ token: string; expiresAt: Date }> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${dto.customerId} not found`);
    }

    const token = uuid();
    const expiryHours = dto.expiryHours ?? 24;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    await this.prisma.magicLink.create({
      data: {
        customerId: dto.customerId,
        token,
        expiresAt,
      },
    });

    this.logger.log(
      `Magic link generated for customer ${dto.customerId}, expires ${expiresAt.toISOString()}`,
    );

    return { token, expiresAt };
  }

  /**
   * Validate a magic link token and return the customer.
   */
  async validateMagicLink(token: string) {
    const magicLink = await this.prisma.magicLink.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: {
        customer: true,
      },
    });

    if (!magicLink) {
      throw new NotFoundException('Magic link expired or not found');
    }

    // Mark as used
    await this.prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    return magicLink.customer;
  }

  /**
   * Get all work orders for a customer (accessed via magic link).
   */
  async getCustomerWorkOrders(customerId: string) {
    return this.prisma.workOrder.findMany({
      where: { customerId },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        serviceType: true,
        address: true,
        scheduledStart: true,
        scheduledEnd: true,
        trackingToken: true,
        trackingExpiresAt: true,
        technician: {
          select: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { scheduledStart: 'desc' },
    });
  }
}
