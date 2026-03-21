import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let prisma: any;

  const mockDashboard = {
    id: 'dash-1',
    name: 'Test Dashboard',
    layout: {},
    isPublished: false,
    organizationId: 'org-1',
    widgets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWidget = {
    id: 'widget-1',
    type: 'line_chart',
    config: {},
    position: 0,
    size: 'medium',
    dashboardId: 'dash-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findMany: vi.fn().mockResolvedValue([mockDashboard]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockDashboard),
        update: vi.fn().mockResolvedValue(mockDashboard),
        delete: vi.fn().mockResolvedValue(mockDashboard),
      },
      dashboardWidget: {
        create: vi.fn().mockResolvedValue(mockWidget),
        update: vi.fn().mockResolvedValue(mockWidget),
        delete: vi.fn().mockResolvedValue(mockWidget),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DashboardsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardsService>(DashboardsService);
  });

  describe('findAll', () => {
    it('should return dashboards for org', async () => {
      const result = await service.findAll('org-1');
      expect(result).toEqual([mockDashboard]);
    });

    it('should include widgets', async () => {
      await service.findAll('org-1');
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ include: { widgets: true } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return dashboard by id', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      const result = await service.findOne('dash-1');
      expect(result).toEqual(mockDashboard);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      await service.create({ name: 'New Dashboard' }, 'org-1');
      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Dashboard',
          organizationId: 'org-1',
        }),
        include: { widgets: true },
      });
    });
  });

  describe('addWidget', () => {
    it('should create a widget for a dashboard', async () => {
      const result = await service.addWidget('dash-1', { type: 'bar_chart' });
      expect(result).toEqual(mockWidget);
      expect(prisma.dashboardWidget.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dashboardId: 'dash-1',
          type: 'bar_chart',
        }),
      });
    });
  });

  describe('updateWidget', () => {
    it('should update a widget', async () => {
      await service.updateWidget('widget-1', { type: 'pie_chart' });
      expect(prisma.dashboardWidget.update).toHaveBeenCalledWith({
        where: { id: 'widget-1' },
        data: { type: 'pie_chart' },
      });
    });
  });

  describe('removeWidget', () => {
    it('should delete a widget', async () => {
      await service.removeWidget('widget-1');
      expect(prisma.dashboardWidget.delete).toHaveBeenCalledWith({
        where: { id: 'widget-1' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      await service.remove('dash-1');
      expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
    });
  });
});
