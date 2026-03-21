import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';
import { TechnicianAvailability } from '@prisma/client';

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
    companyContext = { setCompanyContext: jest.fn() };

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

  describe('findAll', () => {
    it('should return all technicians', async () => {
      const technicians = [{ id: '1', skills: ['plumbing'], companyId: 'c1' }];
      prisma.technician.findMany.mockResolvedValue(technicians);

      const result = await service.findAll('c1');
      expect(result).toEqual(technicians);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const dto = { userId: 'u1', skills: ['electrical'], availability: TechnicianAvailability.AVAILABLE };
      prisma.technician.create.mockResolvedValue({ id: '1', ...dto, companyId: 'c1' });

      const result = await service.create(dto, 'c1');
      expect(result.skills).toEqual(['electrical']);
    });
  });

  describe('update', () => {
    it('should update technician availability', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: '1', companyId: 'c1' });
      prisma.technician.update.mockResolvedValue({ id: '1', availability: TechnicianAvailability.ON_JOB });

      const result = await service.update('1', { availability: TechnicianAvailability.ON_JOB }, 'c1');
      expect(result.availability).toBe(TechnicianAvailability.ON_JOB);
    });
  });
});
