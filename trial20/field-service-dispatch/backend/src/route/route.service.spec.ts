import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: {
    route: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };
  let companyContext: { setCompanyContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      route: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    companyContext = { setCompanyContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
        { provide: CompanyContextService, useValue: companyContext },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all routes', async () => {
      const routes = [{ id: '1', distance: 15.5, companyId: 'c1' }];
      prisma.route.findMany.mockResolvedValue(routes);

      const result = await service.findAll('c1');
      expect(result).toEqual(routes);
    });
  });

  describe('create', () => {
    it('should create a route with Float distance', async () => {
      const dto = { technicianId: 't1', workOrderId: 'wo1', distance: 25.7, estimatedMinutes: 45 };
      prisma.route.create.mockResolvedValue({ id: '1', ...dto, companyId: 'c1' });

      const result = await service.create(dto, 'c1');
      expect(result.distance).toBe(25.7);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when route not found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
