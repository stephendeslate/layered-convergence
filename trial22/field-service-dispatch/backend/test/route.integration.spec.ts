// Integration tests for RouteService — REAL database, NO Prisma mocking

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteModule } from '../src/route/route.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RouteService } from '../src/route/route.service';

describe('RouteService Integration', () => {
  let module: TestingModule;
  let routeService: RouteService;
  let prisma: PrismaService;
  let companyId: string;
  let technicianId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [RouteModule, PrismaModule],
    }).compile();

    routeService = module.get<RouteService>(RouteService);
    prisma = module.get<PrismaService>(PrismaService);

    const company = await prisma.company.create({
      data: { name: 'Route Test Company' },
    });
    companyId = company.id;

    const technician = await prisma.technician.create({
      data: {
        name: 'Route Test Tech',
        companyId,
      },
    });
    technicianId = technician.id;
  });

  afterAll(async () => {
    await prisma.workOrder.deleteMany({ where: { companyId } });
    await prisma.route.deleteMany({ where: { companyId } });
    await prisma.technician.deleteMany({ where: { companyId } });
    await prisma.customer.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await module.close();
  });

  it('should create a route', async () => {
    const route = await routeService.create(
      {
        name: 'Morning Route',
        date: '2026-03-21T08:00:00.000Z',
        technicianId,
        estimatedDistance: 45.5,
      },
      companyId,
    );

    expect(route).toBeDefined();
    expect(route.name).toBe('Morning Route');
    expect(route.estimatedDistance).toBeCloseTo(45.5, 1);
    expect(route.technicianId).toBe(technicianId);
    expect(route.companyId).toBe(companyId);
  });

  it('should create a route with work orders', async () => {
    const customer = await prisma.customer.create({
      data: {
        name: 'Route Customer',
        address: '500 Route St',
        companyId,
      },
    });

    const wo1 = await prisma.workOrder.create({
      data: {
        title: 'Route WO 1',
        status: 'ASSIGNED',
        priority: 'MEDIUM',
        customerId: customer.id,
        technicianId,
        companyId,
      },
    });

    const wo2 = await prisma.workOrder.create({
      data: {
        title: 'Route WO 2',
        status: 'ASSIGNED',
        priority: 'HIGH',
        customerId: customer.id,
        technicianId,
        companyId,
      },
    });

    const route = await routeService.create(
      {
        name: 'Afternoon Route',
        date: '2026-03-21T13:00:00.000Z',
        technicianId,
        estimatedDistance: 30.0,
        workOrderIds: [wo1.id, wo2.id],
      },
      companyId,
    );

    expect(route.workOrders.length).toBe(2);
  });

  it('should list routes for a company', async () => {
    const routes = await routeService.findAll(companyId);

    expect(routes.length).toBeGreaterThanOrEqual(1);
    for (const r of routes) {
      expect(r.companyId).toBe(companyId);
      expect(r.technician).toBeDefined();
    }
  });

  it('should find a route by ID', async () => {
    const created = await routeService.create(
      {
        name: 'Find Test Route',
        date: '2026-03-22T09:00:00.000Z',
        technicianId,
        estimatedDistance: 20.0,
      },
      companyId,
    );

    const found = await routeService.findOne(created.id, companyId);
    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Find Test Route');
  });

  it('should throw NotFoundException for non-existent route', async () => {
    await expect(
      routeService.findOne('00000000-0000-0000-0000-000000000000', companyId),
    ).rejects.toThrow(NotFoundException);
  });
});
