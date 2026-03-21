import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GpsGateway } from './gps.gateway';
import { GpsService } from './gps.service';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let gpsService: any;

  beforeEach(async () => {
    gpsService = {
      recordPosition: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsGateway,
        { provide: GpsService, useValue: gpsService },
      ],
    }).compile();

    gateway = module.get<GpsGateway>(GpsGateway);
    gateway.server = {
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join company room on connection', () => {
      const client = {
        handshake: { query: { companyId: 'company-1' } },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(client);
      expect(client.join).toHaveBeenCalledWith('company:company-1');
    });

    it('should not join room if no companyId', () => {
      const client = {
        handshake: { query: {} },
        join: vi.fn(),
      } as any;

      gateway.handleConnection(client);
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handlePositionUpdate', () => {
    it('should record position and broadcast', async () => {
      const data = {
        companyId: 'company-1',
        technicianId: 't1',
        lat: 40.7128,
        lng: -74.006,
      };
      const event = { id: 'gps1', timestamp: new Date() };
      gpsService.recordPosition.mockResolvedValue(event);

      const client = {} as any;
      const result = await gateway.handlePositionUpdate(client, data);

      expect(gpsService.recordPosition).toHaveBeenCalledWith('company-1', {
        technicianId: 't1',
        lat: 40.7128,
        lng: -74.006,
        accuracy: undefined,
      });
      expect(result.status).toBe('ok');
      expect(result.eventId).toBe('gps1');
    });

    it('should broadcast to company room', async () => {
      const data = {
        companyId: 'company-1',
        technicianId: 't1',
        lat: 40.7128,
        lng: -74.006,
      };
      gpsService.recordPosition.mockResolvedValue({ id: 'gps1', timestamp: new Date() });

      const client = {} as any;
      await gateway.handlePositionUpdate(client, data);

      expect(gateway.server.to).toHaveBeenCalledWith('company:company-1');
    });

    it('should return error on failure', async () => {
      gpsService.recordPosition.mockRejectedValue(new Error('Technician not found'));

      const client = {} as any;
      const result = await gateway.handlePositionUpdate(client, {
        companyId: 'c1',
        technicianId: 'missing',
        lat: 0,
        lng: 0,
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('Technician not found');
    });
  });

  describe('handleJoinCompany', () => {
    it('should join company room', () => {
      const client = { join: vi.fn() } as any;
      const result = gateway.handleJoinCompany(client, { companyId: 'company-1' });
      expect(client.join).toHaveBeenCalledWith('company:company-1');
      expect(result.status).toBe('joined');
    });
  });
});
