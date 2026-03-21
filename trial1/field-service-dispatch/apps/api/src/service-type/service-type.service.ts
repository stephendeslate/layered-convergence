import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service type catalog management.
 *
 * Since ServiceType is a Prisma enum (not a DB entity),
 * this service provides metadata, skill mapping, and base pricing
 * stored in company settings or a dedicated config.
 */

export interface ServiceTypeInfo {
  code: string;
  name: string;
  category: string;
  requiredSkills: string[];
  basePrice: number;
  estimatedMinutes: number;
  description?: string;
}

export interface UpdateServiceTypeDto {
  basePrice?: number;
  estimatedMinutes?: number;
  description?: string;
  requiredSkills?: string[];
}

// Default service type catalog
const DEFAULT_SERVICE_CATALOG: ServiceTypeInfo[] = [
  { code: 'HVAC_INSTALL', name: 'HVAC Installation', category: 'HVAC', requiredSkills: ['HVAC_INSTALL'], basePrice: 3500, estimatedMinutes: 480 },
  { code: 'HVAC_REPAIR', name: 'HVAC Repair', category: 'HVAC', requiredSkills: ['HVAC_REPAIR'], basePrice: 250, estimatedMinutes: 120 },
  { code: 'HVAC_MAINTENANCE', name: 'HVAC Maintenance', category: 'HVAC', requiredSkills: ['HVAC_MAINTENANCE'], basePrice: 150, estimatedMinutes: 60 },
  { code: 'PLUMBING_REPAIR', name: 'Plumbing Repair', category: 'Plumbing', requiredSkills: ['PLUMBING_REPAIR'], basePrice: 200, estimatedMinutes: 90 },
  { code: 'PLUMBING_INSTALL', name: 'Plumbing Installation', category: 'Plumbing', requiredSkills: ['PLUMBING_INSTALL'], basePrice: 1500, estimatedMinutes: 360 },
  { code: 'ELECTRICAL_REPAIR', name: 'Electrical Repair', category: 'Electrical', requiredSkills: ['ELECTRICAL_REPAIR'], basePrice: 225, estimatedMinutes: 90 },
  { code: 'ELECTRICAL_INSTALL', name: 'Electrical Installation', category: 'Electrical', requiredSkills: ['ELECTRICAL_INSTALL'], basePrice: 2000, estimatedMinutes: 300 },
  { code: 'GENERAL_MAINTENANCE', name: 'General Maintenance', category: 'General', requiredSkills: ['GENERAL_MAINTENANCE'], basePrice: 100, estimatedMinutes: 60 },
  { code: 'CLEANING', name: 'Cleaning Service', category: 'General', requiredSkills: ['CLEANING'], basePrice: 80, estimatedMinutes: 120 },
  { code: 'PEST_CONTROL', name: 'Pest Control', category: 'Specialty', requiredSkills: ['PEST_CONTROL'], basePrice: 175, estimatedMinutes: 60 },
  { code: 'LANDSCAPING', name: 'Landscaping', category: 'Specialty', requiredSkills: ['LANDSCAPING'], basePrice: 200, estimatedMinutes: 180 },
  { code: 'APPLIANCE_REPAIR', name: 'Appliance Repair', category: 'General', requiredSkills: ['APPLIANCE_REPAIR'], basePrice: 175, estimatedMinutes: 90 },
  { code: 'OTHER', name: 'Other', category: 'General', requiredSkills: [], basePrice: 100, estimatedMinutes: 60 },
];

@Injectable()
export class ServiceTypeService {
  private readonly logger = new Logger(ServiceTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all service types with company-specific overrides.
   */
  async list(companyId: string): Promise<ServiceTypeInfo[]> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { settings: true },
    });

    const settings = (company?.settings as Record<string, any>) ?? {};
    const overrides: Record<string, Partial<ServiceTypeInfo>> =
      settings.serviceTypeOverrides ?? {};

    return DEFAULT_SERVICE_CATALOG.map((st) => ({
      ...st,
      ...(overrides[st.code] ?? {}),
      code: st.code, // code cannot be overridden
    }));
  }

  /**
   * Get a single service type by code.
   */
  async get(companyId: string, code: string): Promise<ServiceTypeInfo> {
    const catalog = await this.list(companyId);
    const serviceType = catalog.find((st) => st.code === code);

    if (!serviceType) {
      // Return default for unknown codes
      return {
        code,
        name: code.replace(/_/g, ' '),
        category: 'Other',
        requiredSkills: [],
        basePrice: 100,
        estimatedMinutes: 60,
      };
    }

    return serviceType;
  }

  /**
   * Update company-specific overrides for a service type.
   */
  async update(
    companyId: string,
    code: string,
    dto: UpdateServiceTypeDto,
  ): Promise<ServiceTypeInfo> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { settings: true },
    });

    const settings = (company?.settings as Record<string, any>) ?? {};
    const overrides: Record<string, Partial<ServiceTypeInfo>> =
      settings.serviceTypeOverrides ?? {};

    overrides[code] = {
      ...(overrides[code] ?? {}),
      ...dto,
    };

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        settings: {
          ...settings,
          serviceTypeOverrides: overrides,
        },
      },
    });

    return this.get(companyId, code);
  }

  /**
   * Get service types grouped by category.
   */
  async listByCategory(companyId: string): Promise<Record<string, ServiceTypeInfo[]>> {
    const catalog = await this.list(companyId);
    const byCategory: Record<string, ServiceTypeInfo[]> = {};

    for (const st of catalog) {
      if (!byCategory[st.category]) byCategory[st.category] = [];
      byCategory[st.category].push(st);
    }

    return byCategory;
  }

  /**
   * Get the required skills for a service type.
   * Used by auto-assignment to match technicians.
   */
  async getRequiredSkills(companyId: string, code: string): Promise<string[]> {
    const serviceType = await this.get(companyId, code);
    return serviceType.requiredSkills;
  }
}
