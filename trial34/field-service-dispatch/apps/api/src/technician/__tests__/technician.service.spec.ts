import { Test } from '@nestjs/testing';
import { TechnicianService } from '../technician.service';
import { PrismaService } from '../../prisma.service';

// TRACED: FD-TA-UNIT-003 — Technician service unit tests
describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: {
    setTenantContext: jest.Mock;
    technician: { findMany: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      setTenantContext: jest.fn(),
      technician: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        TechnicianService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TechnicianService);
  });

  it('should set tenant context before findAll', async () => {
    await service.findAll('tenant-1');
    expect(prisma.setTenantContext).toHaveBeenCalledWith('tenant-1');
    expect(prisma.technician.findMany).toHaveBeenCalled();
  });

  it('should create technician with slugified name', async () => {
    prisma.technician.create.mockResolvedValue({
      id: '1',
      name: 'John Smith',
      slug: 'john-smith',
      specialization: 'HVAC',
    });

    const result = await service.create('John Smith', 'HVAC', 'tenant-1');
    expect(prisma.technician.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'john-smith' }),
      }),
    );
    expect(result.slug).toBe('john-smith');
  });
});
