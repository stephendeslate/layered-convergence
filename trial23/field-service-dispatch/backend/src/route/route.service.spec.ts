import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
    it('should return all routes for company', async () => {
      const routes = [{ id: '1', name: 'Route A', companyId: 'c1' }];
      prisma.route.findMany.mockResolvedValue(routes);

      const result = await service.findAll('c1');
      expect(result).toEqual(routes);
    });
  });

  describe('findOne', () => {
    it('should return a route', async () => {
      const route = { id: '1', name: 'Route A', companyId: 'c1' };
      prisma.route.findFirst.mockResolvedValue(route);

      const result = await service.findOne('1', 'c1');
      expect(result).toEqual(route);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a route', async () => {
      const data = {
        name: 'Route A',
        date: new Date(),
        estimatedDistance: 25.5,
        technicianId: 'tech-1',
        companyId: 'c1',
      };

      prisma.route.create.mockResolvedValue({ id: '1', ...data });

      const result = await service.create(data);
      expect(result.name).toBe('Route A');
    });
  });

  describe('update', () => {
    it('should update a route', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: '1', name: 'Route A', companyId: 'c1' });
      prisma.route.update.mockResolvedValue({ id: '1', name: 'Route B', companyId: 'c1' });

      const result = await service.update('1', 'c1', { name: 'Route B' });
      expect(result.name).toBe('Route B');
    });
  });

  describe('remove', () => {
    it('should delete a route', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: '1', name: 'Route A', companyId: 'c1' });
      prisma.route.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', 'c1');
      expect(result).toEqual({ id: '1' });
    });
  });
});
