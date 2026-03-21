import { Test, TestingModule } from '@nestjs/testing';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { NotFoundException } from '@nestjs/common';
import { WidgetType } from '@prisma/client';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: {
    widget: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; delete: jest.Mock };
  };
  let tenantContext: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      widget: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantContext = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  it('should find widgets by dashboard', async () => {
    const widgets = [{ id: '1', title: 'Revenue Chart', type: WidgetType.BAR }];
    prisma.widget.findMany.mockResolvedValue(widgets);

    const result = await service.findByDashboard('dash-1', 't1');
    expect(result).toEqual(widgets);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    prisma.widget.findUnique.mockResolvedValue({ id: '1', tenantId: 't2' });

    await expect(service.findById('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create a widget', async () => {
    const created = { id: '1', title: 'KPI', type: WidgetType.KPI };
    prisma.widget.create.mockResolvedValue(created);

    const result = await service.create(
      { title: 'KPI', type: WidgetType.KPI, dashboardId: 'dash-1' },
      't1',
    );
    expect(result).toEqual(created);
  });
});
