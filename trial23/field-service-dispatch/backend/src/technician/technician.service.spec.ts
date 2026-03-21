import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../prisma/prisma.service';

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechnicianService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TechnicianService>(TechnicianService);
  });

  describe('findAll', () => {
    it('should return all technicians for company', async () => {
      const technicians = [{ id: '1', name: 'John', companyId: 'c1' }];
      prisma.technician.findMany.mockResolvedValue(technicians);

      const result = await service.findAll('c1');
      expect(result).toEqual(technicians);
    });
  });

  describe('findOne', () => {
    it('should return a technician', async () => {
      const technician = { id: '1', name: 'John', companyId: 'c1' };
      prisma.technician.findFirst.mockResolvedValue(technician);

      const result = await service.findOne('1', 'c1');
      expect(result).toEqual(technician);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const data = { name: 'John', email: 'john@test.com', companyId: 'c1' };
      prisma.technician.create.mockResolvedValue({ id: '1', ...data });

      const result = await service.create(data);
      expect(result.name).toBe('John');
    });
  });

  describe('update', () => {
    it('should update a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: '1', name: 'John', companyId: 'c1' });
      prisma.technician.update.mockResolvedValue({ id: '1', name: 'John Smith', companyId: 'c1' });

      const result = await service.update('1', 'c1', { name: 'John Smith' });
      expect(result.name).toBe('John Smith');
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: '1', name: 'John', companyId: 'c1' });
      prisma.technician.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', 'c1');
      expect(result).toEqual({ id: '1' });
    });
  });
});
