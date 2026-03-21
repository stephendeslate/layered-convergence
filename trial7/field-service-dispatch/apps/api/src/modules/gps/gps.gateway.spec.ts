import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GpsGateway } from './gps.gateway';
import { TechnicianService } from '../technician/technician.service';
import { io, Socket as ClientSocket } from 'socket.io-client';

/**
 * WebSocket gateway companion test (Convention 5.20).
 * Tests the GPS gateway using socket.io-client for realistic interaction.
 */
describe('GpsGateway', () => {
  let app: INestApplication;
  let gateway: GpsGateway;
  let clientSocket: ClientSocket;

  const mockTechnicianService = {
    updateLocation: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsGateway,
        { provide: TechnicianService, useValue: mockTechnicianService },
      ],
    }).compile();

    app = module.createNestApplication();
    gateway = module.get<GpsGateway>(GpsGateway);
    await app.listen(0);

    const address = app.getHttpServer().address();
    const port = typeof address === 'object' ? address?.port : 0;

    clientSocket = io(`http://localhost:${port}/gps`, {
      transports: ['websocket'],
    });

    await new Promise<void>((resolve) => {
      clientSocket.on('connect', () => resolve());
    });
  });

  afterAll(async () => {
    clientSocket?.disconnect();
    await app?.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle GPS update and broadcast position', (done) => {
    const gpsData = {
      technicianId: 'tech-1',
      lat: 40.7128,
      lng: -74.006,
      timestamp: new Date().toISOString(),
    };

    clientSocket.on('gps:position', (data: Record<string, unknown>) => {
      expect(data).toMatchObject({
        technicianId: 'tech-1',
        lat: 40.7128,
        lng: -74.006,
      });
      expect(mockTechnicianService.updateLocation).toHaveBeenCalledWith(
        'tech-1',
        40.7128,
        -74.006,
      );
      done();
    });

    clientSocket.emit('gps:update', gpsData);
  });

  it('should handle subscription to company', (done) => {
    clientSocket.emit(
      'gps:subscribe',
      { companyId: 'company-1' },
      (response: Record<string, unknown>) => {
        expect(response).toMatchObject({
          event: 'gps:subscribed',
          data: { companyId: 'company-1' },
        });
        done();
      },
    );
  });
});
