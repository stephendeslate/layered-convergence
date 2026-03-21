import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceTypeService } from './service-type.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ServiceTypeService', () => {
  let service: ServiceTypeService;
  let prisma: any;

  const COMPANY_ID = 'company-1';

  beforeEach(async () => {
    prisma = {
      company: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceTypeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ServiceTypeService>(ServiceTypeService);
  });

  describe('list', () => {
    it('should return default catalog when no overrides', async () => {
      prisma.company.findUnique.mockResolvedValue({ settings: {} });

      const result = await service.list(COMPANY_ID);

      expect(result.length).toBeGreaterThan(0);
      expect(result.find((s) => s.code === 'HVAC_REPAIR')).toBeDefined();
    });

    it('should apply company-specific overrides', async () => {
      prisma.company.findUnique.mockResolvedValue({
        settings: {
          serviceTypeOverrides: {
            HVAC_REPAIR: { basePrice: 500, estimatedMinutes: 180 },
          },
        },
      });

      const result = await service.list(COMPANY_ID);
      const hvacRepair = result.find((s) => s.code === 'HVAC_REPAIR');

      expect(hvacRepair).toBeDefined();
      expect(hvacRepair!.basePrice).toBe(500);
      expect(hvacRepair!.estimatedMinutes).toBe(180);
    });
  });

  describe('get', () => {
    it('should return a single service type', async () => {
      prisma.company.findUnique.mockResolvedValue({ settings: {} });

      const result = await service.get(COMPANY_ID, 'HVAC_REPAIR');

      expect(result.code).toBe('HVAC_REPAIR');
      expect(result.category).toBe('HVAC');
      expect(result.basePrice).toBeGreaterThan(0);
    });

    it('should return a default for unknown codes', async () => {
      prisma.company.findUnique.mockResolvedValue({ settings: {} });

      const result = await service.get(COMPANY_ID, 'UNKNOWN_CODE');

      expect(result.code).toBe('UNKNOWN_CODE');
      expect(result.basePrice).toBe(100);
    });
  });

  describe('update', () => {
    it('should update company-specific override', async () => {
      prisma.company.findUnique
        .mockResolvedValueOnce({ settings: {} })
        .mockResolvedValueOnce({
          settings: {
            serviceTypeOverrides: { HVAC_REPAIR: { basePrice: 999 } },
          },
        });
      prisma.company.update.mockResolvedValue({});

      const result = await service.update(COMPANY_ID, 'HVAC_REPAIR', {
        basePrice: 999,
      });

      expect(prisma.company.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settings: expect.objectContaining({
              serviceTypeOverrides: expect.objectContaining({
                HVAC_REPAIR: expect.objectContaining({ basePrice: 999 }),
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('listByCategory', () => {
    it('should group service types by category', async () => {
      prisma.company.findUnique.mockResolvedValue({ settings: {} });

      const result = await service.listByCategory(COMPANY_ID);

      expect(result).toHaveProperty('HVAC');
      expect(result).toHaveProperty('Plumbing');
      expect(result['HVAC'].length).toBeGreaterThan(0);
    });
  });

  describe('getRequiredSkills', () => {
    it('should return required skills for a service type', async () => {
      prisma.company.findUnique.mockResolvedValue({ settings: {} });

      const skills = await service.getRequiredSkills(COMPANY_ID, 'HVAC_REPAIR');

      expect(skills).toContain('HVAC_REPAIR');
    });
  });
});
