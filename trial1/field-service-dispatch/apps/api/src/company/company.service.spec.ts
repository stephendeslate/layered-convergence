import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: any;
  let audit: any;

  const COMPANY_ID = 'company-1';

  function makeCompany(overrides: Record<string, any> = {}) {
    return {
      id: COMPANY_ID,
      name: 'Test Company',
      slug: 'test-company',
      email: 'admin@test.com',
      phone: '555-0100',
      logoUrl: null,
      website: null,
      taxRate: 0.08,
      serviceAreaPolygon: null,
      timezone: 'America/New_York',
      settings: {},
      stripeCustomerId: null,
      stripeAccountId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      company: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  describe('get', () => {
    it('should return company with counts', async () => {
      prisma.company.findUnique.mockResolvedValue({
        ...makeCompany(),
        _count: { users: 5, technicians: 3, customers: 10, workOrders: 50 },
      });

      const result = await service.get(COMPANY_ID);
      expect(result.name).toBe('Test Company');
      expect(result._count.users).toBe(5);
    });

    it('should throw NotFoundException for missing company', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(service.get('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update company fields', async () => {
      const company = makeCompany();
      prisma.company.findUnique.mockResolvedValue(company);
      prisma.company.update.mockResolvedValue({ ...company, name: 'Updated Co' });

      const result = await service.update(COMPANY_ID, { name: 'Updated Co' }, 'user-1');

      expect(prisma.company.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: 'Updated Co' },
        }),
      );
      expect(audit.log).toHaveBeenCalled();
    });
  });

  describe('updateBranding', () => {
    it('should update branding settings', async () => {
      const company = makeCompany({ settings: {} });
      prisma.company.findUnique.mockResolvedValue(company);
      prisma.company.update.mockResolvedValue(company);

      await service.updateBranding(COMPANY_ID, {
        primaryColor: '#FF0000',
        tagline: 'Best HVAC',
      }, 'user-1');

      expect(prisma.company.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settings: expect.objectContaining({
              branding: expect.objectContaining({
                primaryColor: '#FF0000',
                tagline: 'Best HVAC',
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('setServiceArea', () => {
    it('should set a valid GeoJSON polygon', async () => {
      prisma.company.findUnique.mockResolvedValue(makeCompany());
      prisma.company.update.mockResolvedValue(makeCompany());

      const polygon = JSON.stringify({
        type: 'Polygon',
        coordinates: [[[-89.7, 39.7], [-89.6, 39.7], [-89.6, 39.8], [-89.7, 39.8], [-89.7, 39.7]]],
      });

      await service.setServiceArea(COMPANY_ID, { polygon }, 'user-1');

      expect(prisma.company.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { serviceAreaPolygon: polygon },
        }),
      );
    });

    it('should reject invalid GeoJSON', async () => {
      prisma.company.findUnique.mockResolvedValue(makeCompany());

      await expect(
        service.setServiceArea(COMPANY_ID, { polygon: 'not json' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject non-polygon GeoJSON', async () => {
      prisma.company.findUnique.mockResolvedValue(makeCompany());

      const point = JSON.stringify({ type: 'Point', coordinates: [-89.7, 39.7] });
      await expect(
        service.setServiceArea(COMPANY_ID, { polygon: point }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSettings', () => {
    it('should return company settings', async () => {
      prisma.company.findUnique.mockResolvedValue(
        makeCompany({ settings: { branding: { primaryColor: '#FF0000' } } }),
      );

      const result = await service.getSettings(COMPANY_ID);
      expect(result.companyId).toBe(COMPANY_ID);
      expect(result.settings).toHaveProperty('branding');
    });
  });
});
