// [TRACED:TS-003] Unit test for RouteService — state machine transitions
import { Test, TestingModule } from '@nestjs/testing';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: {
    route: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let tenantContext: { setTenantContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      route: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    tenantContext = {
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException when route not found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('route-1', 'user-1', 'company-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid transition PLANNED -> IN_PROGRESS', async () => {
      prisma.route.findFirst.mockResolvedValue({
        id: 'route-1',
        status: 'PLANNED',
      });
      prisma.route.update.mockResolvedValue({
        id: 'route-1',
        status: 'IN_PROGRESS',
      });

      const result = await service.updateStatus(
        'route-1',
        'IN_PROGRESS' as never,
        'user-1',
        'company-1',
      );
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should reject invalid transition PLANNED -> COMPLETED', async () => {
      prisma.route.findFirst.mockResolvedValue({
        id: 'route-1',
        status: 'PLANNED',
      });

      await expect(
        service.updateStatus(
          'route-1',
          'COMPLETED' as never,
          'user-1',
          'company-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
