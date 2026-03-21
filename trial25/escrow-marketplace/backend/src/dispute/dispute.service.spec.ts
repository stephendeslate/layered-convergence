import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:TS-003] Unit test for DisputeService with mocked dependencies
describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };
  let tenantContext: { setUserContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dispute: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    tenantContext = { setUserContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  it('should list disputes for a user', async () => {
    prisma.dispute.findMany.mockResolvedValue([{ id: 'd-1' }]);
    const result = await service.findAll('user-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when dispute not found', async () => {
    prisma.dispute.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('should enforce state machine: OPEN can only go to UNDER_REVIEW', async () => {
    prisma.dispute.findFirst.mockResolvedValue({ id: 'd-1', status: 'OPEN', filedById: 'user-1' });
    await expect(service.transition('d-1', 'user-1', 'RESOLVED')).rejects.toThrow(BadRequestException);
  });
});
