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
import { TechnicianService } from '../technician/technician.service';

interface GpsUpdatePayload {
  technicianId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

/**
 * WebSocket gateway for real-time GPS position streaming.
 *
 * Events:
 *   gps:update     — Technician sends position update
 *   gps:subscribe  — Client subscribes to a technician's position
 *   gps:position   — Server broadcasts position to subscribers
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GpsGateway.name);

  constructor(private readonly technicianService: TechnicianService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('gps:update')
  async handleGpsUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GpsUpdatePayload,
  ): Promise<{ status: string }> {
    const { technicianId, lat, lng, timestamp } = payload;

    // Persist location to database
    await this.technicianService.updateLocation(technicianId, { lat, lng });

    // Broadcast to all clients watching this technician
    this.server.to(`tech:${technicianId}`).emit('gps:position', {
      technicianId,
      lat,
      lng,
      timestamp,
    });

    this.logger.debug(`GPS update: tech ${technicianId} → (${lat}, ${lng})`);
    return { status: 'ok' };
  }

  @SubscribeMessage('gps:subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { technicianId: string },
  ): { status: string } {
    client.join(`tech:${payload.technicianId}`);
    this.logger.log(`Client ${client.id} subscribed to tech:${payload.technicianId}`);
    return { status: 'subscribed' };
  }

  @SubscribeMessage('gps:unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { technicianId: string },
  ): { status: string } {
    client.leave(`tech:${payload.technicianId}`);
    this.logger.log(`Client ${client.id} unsubscribed from tech:${payload.technicianId}`);
    return { status: 'unsubscribed' };
  }
}
