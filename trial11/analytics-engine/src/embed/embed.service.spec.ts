import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EmbedService } from './embed.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenantService } from '../tenant/tenant.service.js';

const mockPrisma = {
  embedConfig: {
    create: vi.fn(),
  },
  dashboard: {
    findUniqueOrThrow: vi.fn(),
  },
};

const mockTenantService = {
  findByApiKey: vi.fn(),
};

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    service = module.get<EmbedService>(EmbedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmbedConfig', () => {
    it('should create an embed config', async () => {
      const dto = {
        dashboardId: 'dash-1',
        allowedOrigins: ['https://example.com'],
      };
      const expected = { id: '1', ...dto };
      mockPrisma.embedConfig.create.mockResolvedValue(expected);

      const result = await service.createEmbedConfig(dto);

      expect(result).toEqual(expected);
    });
  });

  describe('getEmbeddedDashboard', () => {
    it('should return embedded dashboard data', async () => {
      mockTenantService.findByApiKey.mockResolvedValue({
        id: 'tenant-1',
        apiKey: 'key-1',
      });
      mockPrisma.dashboard.findUniqueOrThrow.mockResolvedValue({
        id: 'dash-1',
        name: 'Sales',
        layout: {},
        widgets: [],
        embedConfig: {
          allowedOrigins: ['https://example.com'],
          themeOverrides: null,
        },
      });

      const result = await service.getEmbeddedDashboard('dash-1', 'key-1');

      expect(result.dashboard.id).toBe('dash-1');
      expect(result.embedConfig.allowedOrigins).toContain(
        'https://example.com',
      );
    });

    it('should throw UnauthorizedException for invalid API key', async () => {
      mockTenantService.findByApiKey.mockResolvedValue(null);

      await expect(
        service.getEmbeddedDashboard('dash-1', 'bad-key'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when embed config missing', async () => {
      mockTenantService.findByApiKey.mockResolvedValue({
        id: 'tenant-1',
        apiKey: 'key-1',
      });
      mockPrisma.dashboard.findUniqueOrThrow.mockResolvedValue({
        id: 'dash-1',
        name: 'Sales',
        layout: {},
        widgets: [],
        embedConfig: null,
      });

      await expect(
        service.getEmbeddedDashboard('dash-1', 'key-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
