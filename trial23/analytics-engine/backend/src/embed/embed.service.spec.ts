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
      const data = { dashboardId: 'dash-1', tenantId: 'tenant-1' };
      const created = { id: 'embed-1', token: 'abc-123', ...data, isActive: true };

      mockPrismaService.embed.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return embeds for tenant', async () => {
      const embeds = [{ id: 'embed-1', tenantId: 'tenant-1' }];
      mockPrismaService.embed.findMany.mockResolvedValue(embeds);

      const result = await service.findAll('tenant-1');
      expect(result).toEqual(embeds);
    });
  });

  describe('findOne', () => {
    it('should return embed when found', async () => {
      const embed = { id: 'embed-1', tenantId: 'tenant-1' };
      mockPrismaService.embed.findFirst.mockResolvedValue(embed);

      const result = await service.findOne('embed-1', 'tenant-1');
      expect(result).toEqual(embed);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.embed.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByToken', () => {
    it('should return embed by token', async () => {
      const embed = { id: 'embed-1', token: 'abc-123', isActive: true };
      mockPrismaService.embed.findFirst.mockResolvedValue(embed);

      const result = await service.findByToken('abc-123');
      expect(result).toEqual(embed);
    });

    it('should throw NotFoundException for inactive token', async () => {
      mockPrismaService.embed.findFirst.mockResolvedValue(null);

      await expect(service.findByToken('inactive-token')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update embed active status', async () => {
      const embed = { id: 'embed-1', tenantId: 'tenant-1', isActive: true };
      mockPrismaService.embed.findFirst.mockResolvedValue(embed);
      mockPrismaService.embed.update.mockResolvedValue({ ...embed, isActive: false });

      const result = await service.update('embed-1', 'tenant-1', { isActive: false });
      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    it('should delete embed', async () => {
      const embed = { id: 'embed-1', tenantId: 'tenant-1' };
      mockPrismaService.embed.findFirst.mockResolvedValue(embed);
      mockPrismaService.embed.delete.mockResolvedValue(embed);

      await service.remove('embed-1', 'tenant-1');
      expect(mockPrismaService.embed.delete).toHaveBeenCalledWith({ where: { id: 'embed-1' } });
    });
  });
});
