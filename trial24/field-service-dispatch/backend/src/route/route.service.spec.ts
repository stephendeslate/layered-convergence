import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: {
    route: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      route: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  describe('findAll', () => {
    it('should return routes for a company', async () => {
      const mockRoutes = [{ id: '1', name: 'Route A' }];
      prisma.route.findMany.mockResolvedValue(mockRoutes);

      const result = await service.findAll('c-1');
      expect(result).toEqual(mockRoutes);
    });
  });

  describe('findOne', () => {
    it('should return a route by id and company', async () => {
      const mockRoute = { id: '1', name: 'Route A', companyId: 'c-1' };
      prisma.route.findFirst.mockResolvedValue(mockRoute);

      const result = await service.findOne('1', 'c-1');
      expect(result).toEqual(mockRoute);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad', 'c-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a route with PLANNED status', async () => {
      const data = {
        name: 'Morning Route',
        date: new Date(),
        estimatedDistance: 25.5,
        technicianId: 'tech-1',
        companyId: 'c-1',
      };

      prisma.route.create.mockResolvedValue({ id: '1', ...data, status: 'PLANNED' });

      const result = await service.create(data);
      expect(result.status).toBe('PLANNED');
    });
  });

  describe('transition', () => {
    it('should allow PLANNED -> IN_PROGRESS transition', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: '1', status: 'PLANNED', companyId: 'c-1' });
      prisma.route.update.mockResolvedValue({ id: '1', status: 'IN_PROGRESS' });

      const result = await service.transition('1', 'c-1', 'IN_PROGRESS' as 'IN_PROGRESS');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should allow IN_PROGRESS -> COMPLETED transition', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: '1', status: 'IN_PROGRESS', companyId: 'c-1' });
      prisma.route.update.mockResolvedValue({ id: '1', status: 'COMPLETED' });

      const result = await service.transition('1', 'c-1', 'COMPLETED' as 'COMPLETED');
      expect(result.status).toBe('COMPLETED');
    });

    it('should reject invalid transitions', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', companyId: 'c-1' });

      await expect(
        service.transition('1', 'c-1', 'PLANNED' as 'PLANNED'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a route', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: '1', companyId: 'c-1' });
      prisma.route.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'c-1');
      expect(prisma.route.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
