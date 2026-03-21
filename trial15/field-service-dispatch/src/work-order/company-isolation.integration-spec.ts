import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Company Isolation (Integration)', () => {
  let service: WorkOrderService;
  let prisma: PrismaService;
  let companyAId: string;
  let companyBId: string;
  let customerAId: string;
  let customerBId: string;
  let technicianAId: string;
  let technicianBId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkOrderService, PrismaService],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.cleanDatabase();

    // Company A
    const companyA = await prisma.company.create({ data: { name: 'Company A' } });
    companyAId = companyA.id;

    const customerA = await prisma.customer.create({
      data: {
        name: 'Customer A',
        email: 'a@a.com',
        lat: 40.7,
        lng: -74.0,
        address: '100 A St',
        companyId: companyAId,
      },
    });
    customerAId = customerA.id;

    const techA = await prisma.technician.create({
      data: {
        name: 'Tech A',
        email: 'techA@a.com',
        lat: 40.71,
        lng: -74.01,
        skills: ['plumbing'],
        availability: 'AVAILABLE',
        companyId: companyAId,
      },
    });
    technicianAId = techA.id;

    // Company B
    const companyB = await prisma.company.create({ data: { name: 'Company B' } });
    companyBId = companyB.id;

    const customerB = await prisma.customer.create({
      data: {
        name: 'Customer B',
        email: 'b@b.com',
        lat: 41.0,
        lng: -73.5,
        address: '200 B St',
        companyId: companyBId,
      },
    });
    customerBId = customerB.id;

    const techB = await prisma.technician.create({
      data: {
        name: 'Tech B',
        email: 'techB@b.com',
        lat: 41.01,
        lng: -73.51,
        skills: ['electrical'],
        availability: 'AVAILABLE',
        companyId: companyBId,
      },
    });
    technicianBId = techB.id;
  });

  it('should not allow Company A to see Company B work orders', async () => {
    const woB = await service.create(companyBId, {
      title: 'Company B Work Order',
      customerId: customerBId,
    });

    await expect(service.findOne(woB.id, companyAId)).rejects.toThrow(NotFoundException);
  });

  it('should not allow Company B to see Company A work orders', async () => {
    const woA = await service.create(companyAId, {
      title: 'Company A Work Order',
      customerId: customerAId,
    });

    await expect(service.findOne(woA.id, companyBId)).rejects.toThrow(NotFoundException);
  });

  it('should return only own company work orders in findAll', async () => {
    await service.create(companyAId, { title: 'WO A1', customerId: customerAId });
    await service.create(companyAId, { title: 'WO A2', customerId: customerAId });
    await service.create(companyBId, { title: 'WO B1', customerId: customerBId });

    const companyAOrders = await service.findAll(companyAId);
    const companyBOrders = await service.findAll(companyBId);

    expect(companyAOrders).toHaveLength(2);
    expect(companyBOrders).toHaveLength(1);

    expect(companyAOrders.every((wo: any) => wo.companyId === companyAId)).toBe(true);
    expect(companyBOrders.every((wo: any) => wo.companyId === companyBId)).toBe(true);
  });

  it('should not allow Company A to assign Company B technician', async () => {
    const woA = await service.create(companyAId, {
      title: 'Cross-company assign test',
      customerId: customerAId,
    });

    await expect(
      service.assign(woA.id, companyAId, { technicianId: technicianBId }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should not allow Company B to transition Company A work order', async () => {
    const woA = await service.create(companyAId, {
      title: 'Cross-company transition test',
      customerId: customerAId,
    });

    await expect(
      service.transition(woA.id, companyBId, 'ASSIGNED' as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should not allow creating work order with another company customer', async () => {
    await expect(
      service.create(companyAId, {
        title: 'Wrong customer test',
        customerId: customerBId,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should isolate findByStatus across companies', async () => {
    await service.create(companyAId, { title: 'A Created', customerId: customerAId });
    await service.create(companyBId, { title: 'B Created', customerId: customerBId });

    const aCreated = await service.findByStatus('CREATED' as any, companyAId);
    const bCreated = await service.findByStatus('CREATED' as any, companyBId);

    expect(aCreated).toHaveLength(1);
    expect(bCreated).toHaveLength(1);
    expect(aCreated[0].companyId).toBe(companyAId);
    expect(bCreated[0].companyId).toBe(companyBId);
  });

  it('should isolate findByTechnician across companies', async () => {
    const woA = await service.create(companyAId, { title: 'A WO', customerId: customerAId });
    await service.assign(woA.id, companyAId, { technicianId: technicianAId });

    const techAOrders = await service.findByTechnician(technicianAId, companyAId);
    const techAFromB = await service.findByTechnician(technicianAId, companyBId);

    expect(techAOrders).toHaveLength(1);
    expect(techAFromB).toHaveLength(0);
  });
});
