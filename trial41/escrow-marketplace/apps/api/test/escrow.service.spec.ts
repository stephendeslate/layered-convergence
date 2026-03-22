// TRACED:EM-TEST-04 escrow service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EscrowService } from '../src/escrow/escrow.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('EscrowService', () => {
  let service: EscrowService;

  const mockPrisma = {
    escrow: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EscrowService>(EscrowService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when escrow not found', async () => {
    mockPrisma.escrow.findFirst.mockResolvedValue(null);
    await expect(service.findOne('fake-id', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
