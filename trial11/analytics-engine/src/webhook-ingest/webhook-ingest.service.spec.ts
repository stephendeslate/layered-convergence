import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebhookIngestService } from './webhook-ingest.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenantService } from '../tenant/tenant.service.js';

const mockPrisma = {
  dataSource: {
    findFirst: vi.fn(),
  },
  dataPoint: {
    create: vi.fn(),
  },
  deadLetterEvent: {
    create: vi.fn(),
  },
};

const mockTenantService = {
  findByApiKey: vi.fn(),
};

describe('WebhookIngestService', () => {
  let service: WebhookIngestService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookIngestService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    service = module.get<WebhookIngestService>(WebhookIngestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ingest', () => {
    const payload = {
      dataSourceId: 'ds-1',
      dimensions: { region: 'us' },
      metrics: { count: 1 },
    };

    it('should ingest a valid webhook payload', async () => {
      mockTenantService.findByApiKey.mockResolvedValue({
        id: 'tenant-1',
        apiKey: 'key-1',
      });
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.dataPoint.create.mockResolvedValue({
        id: 'dp-1',
        ...payload,
      });

      const result = await service.ingest('key-1', payload);

      expect(result).toBeDefined();
      expect(mockPrisma.dataPoint.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid API key', async () => {
      mockTenantService.findByApiKey.mockResolvedValue(null);

      await expect(service.ingest('bad-key', payload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when data source not found', async () => {
      mockTenantService.findByApiKey.mockResolvedValue({
        id: 'tenant-1',
        apiKey: 'key-1',
      });
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.ingest('key-1', payload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create dead letter event on failure', async () => {
      mockTenantService.findByApiKey.mockResolvedValue({
        id: 'tenant-1',
        apiKey: 'key-1',
      });
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.dataPoint.create.mockRejectedValue(
        new Error('Insert failed'),
      );
      mockPrisma.deadLetterEvent.create.mockResolvedValue({});

      await expect(service.ingest('key-1', payload)).rejects.toThrow(
        'Insert failed',
      );
      expect(mockPrisma.deadLetterEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dataSourceId: 'ds-1',
          errorReason: 'Insert failed',
        }),
      });
    });
  });
});
