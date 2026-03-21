import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface UpdateCompanyDto {
  name?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  website?: string;
  taxRate?: number;
  timezone?: string;
  serviceAreaPolygon?: string;
  settings?: Record<string, any>;
}

export interface CompanyBrandingDto {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
  tagline?: string;
}

export interface ServiceAreaDto {
  polygon: string; // GeoJSON polygon as string
}

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Get company details by ID.
   */
  async get(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            users: true,
            technicians: true,
            customers: true,
            workOrders: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    return company;
  }

  /**
   * Update company settings.
   */
  async update(companyId: string, dto: UpdateCompanyDto, userId?: string) {
    await this.getOrThrow(companyId);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.taxRate !== undefined) data.taxRate = dto.taxRate;
    if (dto.timezone !== undefined) data.timezone = dto.timezone;
    if (dto.serviceAreaPolygon !== undefined) data.serviceAreaPolygon = dto.serviceAreaPolygon;
    if (dto.settings !== undefined) data.settings = dto.settings;

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data,
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'company.update',
      entityType: 'Company',
      entityId: companyId,
      metadata: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  /**
   * Update company branding/theme configuration.
   */
  async updateBranding(
    companyId: string,
    dto: CompanyBrandingDto,
    userId?: string,
  ) {
    const company = await this.getOrThrow(companyId);

    const currentSettings = (company.settings as Record<string, any>) ?? {};
    const branding = {
      ...currentSettings.branding,
      ...dto,
    };

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        logoUrl: dto.logoUrl ?? company.logoUrl,
        settings: {
          ...currentSettings,
          branding,
        },
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'company.update_branding',
      entityType: 'Company',
      entityId: companyId,
      metadata: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  /**
   * Set service area polygon (GeoJSON).
   */
  async setServiceArea(
    companyId: string,
    dto: ServiceAreaDto,
    userId?: string,
  ) {
    await this.getOrThrow(companyId);

    // Basic GeoJSON validation
    try {
      const parsed = JSON.parse(dto.polygon);
      if (parsed.type !== 'Polygon' && parsed.type !== 'MultiPolygon') {
        throw new BadRequestException(
          'Service area must be a GeoJSON Polygon or MultiPolygon',
        );
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Invalid GeoJSON: ' + err.message);
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { serviceAreaPolygon: dto.polygon },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'company.set_service_area',
      entityType: 'Company',
      entityId: companyId,
    });

    return updated;
  }

  /**
   * Get company settings (extracted from JSON settings field).
   */
  async getSettings(companyId: string) {
    const company = await this.getOrThrow(companyId);
    return {
      companyId,
      settings: company.settings,
      taxRate: company.taxRate,
      timezone: company.timezone,
      serviceAreaPolygon: company.serviceAreaPolygon,
    };
  }

  private async getOrThrow(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    return company;
  }
}
