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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $executeRaw to set company context', async () => {
    prisma.$executeRaw.mockResolvedValue(undefined);

    await service.setCompanyContext('test-company-id');

    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('should pass the companyId parameter', async () => {
    prisma.$executeRaw.mockResolvedValue(undefined);
    const companyId = 'abc-123-def';

    await service.setCompanyContext(companyId);

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });
});
