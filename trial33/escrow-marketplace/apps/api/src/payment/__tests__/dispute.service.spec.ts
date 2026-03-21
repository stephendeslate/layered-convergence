import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DisputeService } from '../dispute.service';
import { PrismaService } from '../../prisma.service';

// TRACED: EM-TST-DISP-001 — Dispute service unit tests
describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: { findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      dispute: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException for unknown dispute', async () => {
    prisma.dispute.findFirst.mockResolvedValue(null);
    await expect(service.transition('x', 'UNDER_REVIEW')).rejects.toThrow(NotFoundException);
  });

  it('should reject invalid state transition', async () => {
    prisma.dispute.findFirst.mockResolvedValue({ id: '1', status: 'CLOSED' });
    await expect(service.transition('1', 'OPEN')).rejects.toThrow(BadRequestException);
  });

  it('should allow OPEN -> UNDER_REVIEW transition', async () => {
    prisma.dispute.findFirst.mockResolvedValue({ id: '1', status: 'OPEN' });
    prisma.dispute.update.mockResolvedValue({ id: '1', status: 'UNDER_REVIEW' });
    const result = await service.transition('1', 'UNDER_REVIEW');
    expect(result.status).toBe('UNDER_REVIEW');
  });
});
