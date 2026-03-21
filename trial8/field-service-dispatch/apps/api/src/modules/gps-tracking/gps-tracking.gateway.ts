import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GpsTrackingService } from './gps-tracking.service';

interface PositionUpdate {
  technicianId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

/**
 * WebSocket gateway for real-time GPS position streaming.
 * Technicians send position updates; dispatch dashboards and customer portals receive them.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  },
  namespace: '/gps',
})
export class GpsTrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GpsTrackingGateway.name);

  constructor(private readonly gpsTrackingService: GpsTrackingService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('position:update')
  async handlePositionUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PositionUpdate,
  ): Promise<void> {
    await this.gpsTrackingService.updatePosition(
      data.technicianId,
      data.lat,
      data.lng,
    );

    // Broadcast to all clients watching this technician's company
    this.server.emit('position:updated', {
      technicianId: data.technicianId,
      lat: data.lat,
      lng: data.lng,
      timestamp: data.timestamp ?? new Date().toISOString(),
    });
  }

  @SubscribeMessage('subscribe:company')
  handleSubscribeCompany(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string },
  ): void {
    client.join(`company:${data.companyId}`);
    this.logger.log(`Client ${client.id} subscribed to company ${data.companyId}`);
  }

  @SubscribeMessage('subscribe:technician')
  handleSubscribeTechnician(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { technicianId: string },
  ): void {
    client.join(`technician:${data.technicianId}`);
    this.logger.log(`Client ${client.id} subscribed to technician ${data.technicianId}`);
  }
}
