import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface CustomerListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(companyId: string, dto: CreateCustomerDto, userId?: string) {
    const customer = await this.prisma.customer.create({
      data: {
        companyId,
        ...dto,
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'customer.create',
      entityType: 'Customer',
      entityId: customer.id,
    });

    return customer;
  }

  async get(companyId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${customerId} not found`);
    }

    return customer;
  }

  async update(companyId: string, customerId: string, dto: Partial<CreateCustomerDto>, userId?: string) {
    await this.getOrThrow(companyId, customerId);

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: dto,
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'customer.update',
      entityType: 'Customer',
      entityId: customerId,
      metadata: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  async delete(companyId: string, customerId: string, userId?: string) {
    await this.getOrThrow(companyId, customerId);

    await this.prisma.customer.delete({
      where: { id: customerId },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'customer.delete',
      entityType: 'Customer',
      entityId: customerId,
    });
  }

  async list(companyId: string, query: CustomerListQuery) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[query.sortBy ?? 'createdAt'] = query.sortOrder ?? 'desc';

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get customer portal data via tracking token (public, no auth).
   */
  async getPortalData(trackingToken: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: {
        trackingToken,
        trackingExpiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        status: true,
        serviceType: true,
        address: true,
        scheduledStart: true,
        scheduledEnd: true,
        latitude: true,
        longitude: true,
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
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Tracking link expired or not found');
    }

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
    };
  }

  private async getOrThrow(companyId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${customerId} not found`);
    }

    return customer;
  }
}
