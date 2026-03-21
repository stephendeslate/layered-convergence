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
    it('should return technicians for a company', async () => {
      const mockTechs = [{ id: '1', name: 'John' }];
      prisma.technician.findMany.mockResolvedValue(mockTechs);

      const result = await service.findAll('c-1');
      expect(result).toEqual(mockTechs);
    });
  });

  describe('findOne', () => {
    it('should return a technician by id and company', async () => {
      const mockTech = { id: '1', name: 'John', companyId: 'c-1' };
      prisma.technician.findFirst.mockResolvedValue(mockTech);

      const result = await service.findOne('1', 'c-1');
      expect(result).toEqual(mockTech);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad', 'c-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const data = { name: 'Jane', email: 'jane@test.com', companyId: 'c-1' };
      prisma.technician.create.mockResolvedValue({ id: '1', ...data });

      const result = await service.create(data);
      expect(result.name).toBe('Jane');
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: '1', companyId: 'c-1' });
      prisma.technician.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'c-1');
      expect(prisma.technician.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
