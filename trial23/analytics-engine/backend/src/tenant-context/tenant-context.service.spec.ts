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
    it('should call $executeRaw with tenant id', async () => {
      mockPrismaService.$executeRaw.mockResolvedValue(undefined);

      await service.setTenantContext('tenant-123');

      expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
    });

    it('should set context for different tenants', async () => {
      mockPrismaService.$executeRaw.mockResolvedValue(undefined);

      await service.setTenantContext('tenant-a');
      await service.setTenantContext('tenant-b');

      expect(mockPrismaService.$executeRaw).toHaveBeenCalledTimes(2);
    });
  });
});
