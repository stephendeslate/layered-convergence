import { Test, TestingModule } from '@nestjs/testing';
import { CompanyContextService } from './company-context.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompanyContextService', () => {
  let service: CompanyContextService;
  let prisma: { $executeRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $executeRaw: jest.fn().mockResolvedValue(1) };

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

  it('should call $executeRaw to set company context', async () => {
    await service.setCompanyContext('company-123');
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('should call $executeRaw to set user context', async () => {
    await service.setUserContext('user-123');
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
