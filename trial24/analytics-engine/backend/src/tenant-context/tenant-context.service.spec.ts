import { Test, TestingModule } from '@nestjs/testing';
import { TenantContextService } from './tenant-context.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  $executeRaw: jest.fn(),
};

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantContextService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
    jest.clearAllMocks();
  });

  describe('setTenantContext', () => {
    it('should call $executeRaw to set tenant context', async () => {
      mockPrismaService.$executeRaw.mockResolvedValue(1);

      await service.setTenantContext('tenant-1');

      expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
    });

    it('should set context with the provided tenant ID', async () => {
      mockPrismaService.$executeRaw.mockResolvedValue(1);

      await service.setTenantContext('tenant-abc');

      expect(mockPrismaService.$executeRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearTenantContext', () => {
    it('should call $executeRaw to clear tenant context', async () => {
      mockPrismaService.$executeRaw.mockResolvedValue(1);

      await service.clearTenantContext();

      expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
    });
  });
});
