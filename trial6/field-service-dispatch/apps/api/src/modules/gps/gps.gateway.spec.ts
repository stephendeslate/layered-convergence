/**
 * WebSocket Gateway companion test file.
 * Required by CED v6.0 Convention 5.20 — WebSocket Gateway Test Pattern.
 *
 * Tests the GpsGateway WebSocket event handling:
 * 1. Position update emission and broadcast
 * 2. Position subscription
 * 3. Broadcast behavior to connected clients
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GpsGateway } from './gps.gateway';
import { GpsService } from './gps.service';

// Mock socket.io-client for unit testing
// In integration tests, use: import { io, Socket } from 'socket.io-client';

describe('GpsGateway', () => {
  let gateway: GpsGateway;
  let gpsService: GpsService;

  const mockGpsService = {
    updatePosition: jest.fn().mockResolvedValue({
      technicianId: 'tech-1',
      lat: 40.7128,
      lng: -74.006,
      timestamp: '2026-03-20T12:00:00.000Z',
    }),
    getPositions: jest.fn().mockResolvedValue([
      {
        id: 'tech-1',
        name: 'John Doe',
        currentLat: 40.7128,
        currentLng: -74.006,
        status: 'AVAILABLE',
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsGateway,
        { provide: GpsService, useValue: mockGpsService },
      ],
    }).compile();

    gateway = module.get<GpsGateway>(GpsGateway);
    gpsService = module.get<GpsService>(GpsService);

    // Mock the WebSocket server
    gateway.server = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as unknown as any; // [JUSTIFIED:TYPE_CAST] — mock server for unit tests
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePositionUpdate', () => {
    it('should update position and broadcast to all clients', async () => {
      const mockClient = {
        handshake: { query: { companyId: 'company-1' } },
        join: jest.fn(),
        emit: jest.fn(),
      } as unknown as any; // [JUSTIFIED:TYPE_CAST] — mock socket for unit tests

      const dto = { technicianId: 'tech-1', lat: 40.7128, lng: -74.006 };

      const result = await gateway.handlePositionUpdate(dto, mockClient);

      expect(mockGpsService.updatePosition).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        technicianId: 'tech-1',
        lat: 40.7128,
        lng: -74.006,
        timestamp: expect.any(String),
      });
      expect(gateway.server.emit).toHaveBeenCalledWith(
        'position:updated',
        expect.objectContaining({ technicianId: 'tech-1' }),
      );
    });
  });

  describe('handlePositionsRequest', () => {
    it('should return all positions for a company', async () => {
      const mockClient = {
        emit: jest.fn(),
      } as unknown as any; // [JUSTIFIED:TYPE_CAST] — mock socket for unit tests

      const result = await gateway.handlePositionsRequest(
        { companyId: 'company-1' },
        mockClient,
      );

      expect(mockGpsService.getPositions).toHaveBeenCalledWith('company-1');
      expect(mockClient.emit).toHaveBeenCalledWith(
        'positions:list',
        expect.arrayContaining([
          expect.objectContaining({ id: 'tech-1' }),
        ]),
      );
    });
  });

  describe('handleConnection', () => {
    it('should join company room on connection', () => {
      const mockClient = {
        handshake: { query: { companyId: 'company-1' } },
        join: jest.fn(),
      } as unknown as any; // [JUSTIFIED:TYPE_CAST] — mock socket for unit tests

      gateway.handleConnection(mockClient);

      expect(mockClient.join).toHaveBeenCalledWith('company:company-1');
    });
  });
});
