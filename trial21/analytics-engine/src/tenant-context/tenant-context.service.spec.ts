import { Test, TestingModule } from '@nestjs/testing';
import { TenantContextService } from './tenant-context.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TenantContextService', () => {
  let service: TenantContextService;
  let prisma: { setTenantContext: jest.Mock };

  beforeEach(async () => {
    prisma = { setTenantContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantContextService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  it('should call prisma.setTenantContext with the given tenant ID', async () => {
    await service.setContext('tenant-123');
    expect(prisma.setTenantContext).toHaveBeenCalledWith('tenant-123');
  });
});
