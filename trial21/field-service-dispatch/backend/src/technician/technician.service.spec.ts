import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';

describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: {
    technician: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let companyContext: { setCompanyContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      technician: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    companyContext = { setCompanyContext: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechnicianService,
        { provide: PrismaService, useValue: prisma },
        { provide: CompanyContextService, useValue: companyContext },
      ],
    }).compile();

    service = module.get<TechnicianService>(TechnicianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all technicians', async () => {
    prisma.technician.findMany.mockResolvedValue([]);
    const result = await service.findAll('c1');
    expect(companyContext.setCompanyContext).toHaveBeenCalledWith('c1');
    expect(result).toEqual([]);
  });

  it('should throw NotFoundException for missing technician', async () => {
    prisma.technician.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'c1')).rejects.toThrow(NotFoundException);
  });

  it('should create a technician', async () => {
    prisma.technician.create.mockResolvedValue({
      id: 't1',
      userId: 'u1',
      skills: ['plumbing'],
      availability: 'AVAILABLE',
    });
    const result = await service.create(
      { userId: 'u1', skills: ['plumbing'] },
      'c1',
    );
    expect(result.id).toBe('t1');
  });
});
