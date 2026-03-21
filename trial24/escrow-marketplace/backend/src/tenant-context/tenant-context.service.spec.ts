import { Test, TestingModule } from '@nestjs/testing';
import { TenantContextService } from './tenant-context.service';
import { PrismaService } from '../prisma/prisma.service';

// [TRACED:TS-002] Tenant context unit test verifies RLS context setting
describe('TenantContextService', () => {
  let service: TenantContextService;
  let prisma: { $executeRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $executeRaw: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantContextService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  describe('setCurrentUser', () => {
    it('should call $executeRaw to set user context', async () => {
      await service.setCurrentUser('user-123');

      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });

  describe('clearCurrentUser', () => {
    it('should call $executeRaw to clear user context', async () => {
      await service.clearCurrentUser();

      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
