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
  let tenantCtx: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      widget: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantCtx = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantCtx },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  it('should find widgets by dashboard', async () => {
    prisma.widget.findMany.mockResolvedValue([{ id: '1', type: WidgetType.BAR }]);
    const result = await service.findByDashboard('dash-1', 'tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException for missing widget', async () => {
    prisma.widget.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a widget', async () => {
    prisma.widget.create.mockResolvedValue({
      id: '1',
      title: 'Revenue Chart',
      type: WidgetType.LINE,
    });
    const result = await service.create(
      { title: 'Revenue Chart', type: WidgetType.LINE, dashboardId: 'dash-1' },
      'tenant-1',
    );
    expect(result.type).toBe(WidgetType.LINE);
  });

  it('should delete a widget', async () => {
    prisma.widget.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    prisma.widget.delete.mockResolvedValue({ id: '1' });
    await service.delete('1', 'tenant-1');
    expect(prisma.widget.delete).toHaveBeenCalled();
  });
});
