import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * GPS Gateway — WebSocket gateway for real-time technician position streaming.
 * Gateway-only module — no service or DTO because inputs come from WebSocket
 * payloads, not HTTP request bodies (conventions 5.30, 5.31).
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GpsGateway.name);

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`GPS client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`GPS client disconnected: ${client.id}`);
  }

  @SubscribeMessage('position:update')
  async handlePositionUpdate(
    @MessageBody() data: { technicianId: string; lat: number; lng: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { technicianId, lat, lng } = data;

    // Update technician position in database
    await this.prisma.technician.update({
      where: { id: technicianId },
      data: { currentLat: lat, currentLng: lng },
    });

    // Broadcast to all connected clients (dispatch dashboard, customer portal)
    this.server.emit('position:updated', {
      technicianId,
      lat,
      lng,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(
      `Position update: technician=${technicianId}, lat=${lat}, lng=${lng}`,
    );
  }

  @SubscribeMessage('subscribe:company')
  handleSubscribeCompany(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`company:${data.companyId}`);
    this.logger.log(`Client ${client.id} subscribed to company ${data.companyId}`);
  }

  @SubscribeMessage('subscribe:technician')
  handleSubscribeTechnician(
    @MessageBody() data: { technicianId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`technician:${data.technicianId}`);
    this.logger.log(`Client ${client.id} subscribed to technician ${data.technicianId}`);
  }
}
