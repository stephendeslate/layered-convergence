import { Test, TestingModule } from '@nestjs/testing';
import { EmbedService } from './embed.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  embed: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EmbedService>(EmbedService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an embed', async () => {
      const data = { tenantId: 'tenant-1', dashboardId: 'd-1' };
      const created = { id: 'e-1', token: 'uuid-token', isActive: true, ...data };

      mockPrismaService.embed.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result.token).toBe('uuid-token');
      expect(result.isActive).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all embeds for tenant', async () => {
      mockPrismaService.embed.findMany.mockResolvedValue([]);
      const result = await service.findAll('tenant-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return embed by id and tenantId', async () => {
      const embed = { id: 'e-1', token: 'token', tenantId: 'tenant-1' };
      mockPrismaService.embed.findFirst.mockResolvedValue(embed);

      const result = await service.findOne('e-1', 'tenant-1');
      expect(result.id).toBe('e-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.embed.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByToken', () => {
    it('should return embed by token', async () => {
      const embed = { id: 'e-1', token: 'uuid-token', isActive: true };
      mockPrismaService.embed.findFirst.mockResolvedValue(embed);

      const result = await service.findByToken('uuid-token');
      expect(result.token).toBe('uuid-token');
    });

    it('should throw NotFoundException for inactive embed', async () => {
      mockPrismaService.embed.findFirst.mockResolvedValue(null);

      await expect(service.findByToken('invalid-token')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate an embed', async () => {
      const embed = { id: 'e-1', isActive: true, tenantId: 'tenant-1' };
      mockPrismaService.embed.findFirst.mockResolvedValue(embed);
      mockPrismaService.embed.update.mockResolvedValue({ ...embed, isActive: false });

      const result = await service.deactivate('e-1', 'tenant-1');
      expect(result.isActive).toBe(false);
    });
  });
});
