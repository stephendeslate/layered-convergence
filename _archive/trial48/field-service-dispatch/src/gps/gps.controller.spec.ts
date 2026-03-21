import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { JwtService } from '@nestjs/jwt';

describe('GpsController', () => {
  let controller: GpsController;
  let service: any;

  beforeEach(async () => {
    service = {
      recordPosition: vi.fn(),
      getHistory: vi.fn(),
      getLatestPositions: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GpsController],
      providers: [
        { provide: GpsService, useValue: service },
        { provide: JwtService, useValue: { verifyAsync: vi.fn() } },
      ],
    }).compile();

    controller = module.get<GpsController>(GpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call recordPosition on service', async () => {
    const dto = { technicianId: 't1', lat: 40.7128, lng: -74.006 };
    service.recordPosition.mockResolvedValue({ id: 'gps1', ...dto });
    const result = await controller.recordPosition('company-1', dto);
    expect(service.recordPosition).toHaveBeenCalledWith('company-1', dto);
    expect(result.id).toBe('gps1');
  });

  it('should call getHistory on service', async () => {
    service.getHistory.mockResolvedValue([{ id: 'gps1' }]);
    const result = await controller.getHistory('company-1', 't1');
    expect(service.getHistory).toHaveBeenCalledWith('company-1', 't1', undefined);
    expect(result).toHaveLength(1);
  });

  it('should parse limit parameter for getHistory', async () => {
    service.getHistory.mockResolvedValue([]);
    await controller.getHistory('company-1', 't1', '10');
    expect(service.getHistory).toHaveBeenCalledWith('company-1', 't1', 10);
  });

  it('should call getLatestPositions on service', async () => {
    service.getLatestPositions.mockResolvedValue([{ id: 't1', currentLat: 40.7128 }]);
    const result = await controller.getLatestPositions('company-1');
    expect(service.getLatestPositions).toHaveBeenCalledWith('company-1');
    expect(result).toHaveLength(1);
  });
});
