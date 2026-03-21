import { Test, TestingModule } from '@nestjs/testing';
import { CompanyContextService } from './company-context.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompanyContextService', () => {
  let service: CompanyContextService;
  let prisma: { $executeRaw: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyContextService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CompanyContextService>(CompanyContextService);
  });

  describe('setCompanyContext', () => {
    it('should execute raw SQL to set company context', async () => {
      prisma.$executeRaw.mockResolvedValue(undefined);

      await service.setCompanyContext('company-uuid-123');

      expect(prisma.$executeRaw).toHaveBeenCalled();
    });

    it('should be callable with different company IDs', async () => {
      prisma.$executeRaw.mockResolvedValue(undefined);

      await service.setCompanyContext('company-a');
      await service.setCompanyContext('company-b');

      expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
    });
  });
});
