import { Test, TestingModule } from '@nestjs/testing';
import { CompanyContextService } from './company-context.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompanyContextService', () => {
  let service: CompanyContextService;
  let prisma: { $executeRaw: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $executeRaw: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyContextService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CompanyContextService>(CompanyContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setCompanyContext', () => {
    it('should call $executeRaw with company id', async () => {
      await service.setCompanyContext('company-123');
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });

  describe('setUserContext', () => {
    it('should call $executeRaw with user id', async () => {
      await service.setUserContext('user-456');
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
