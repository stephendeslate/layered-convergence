import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

export interface GpsUpdatePayload {
  technicianId: string;
  companyId: string;
  lat: number;
  lng: number;
  timestamp?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedClients = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client.id);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('gps:update')
  async handleGpsUpdate(
    @MessageBody() payload: GpsUpdatePayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { technicianId, companyId, lat, lng, timestamp } = payload;

    if (!technicianId || !companyId || lat === undefined || lng === undefined) {
      return { event: 'gps:error', data: { message: 'Missing required fields' } };
    }

    try {
      // Verify technician belongs to company
      // findFirst: scoped by companyId for tenant isolation
      const technician = await this.prisma.technician.findFirst({
        where: { id: technicianId, companyId },
      });

      if (!technician) {
        return { event: 'gps:error', data: { message: 'Technician not found' } };
      }

      // Update technician location
      await this.prisma.technician.update({
        where: { id: technicianId },
        data: { lat, lng },
      });

      // Record GPS event
      const gpsEvent = await this.prisma.gpsEvent.create({
        data: {
          lat,
          lng,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          technicianId,
          companyId,
        },
      });

      // Broadcast to company room
      this.server.to(`company:${companyId}`).emit('gps:position', {
        technicianId,
        lat,
        lng,
        timestamp: gpsEvent.timestamp,
      });

      return { event: 'gps:ack', data: { id: gpsEvent.id } };
    } catch (error) {
      return {
        event: 'gps:error',
        data: { message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  @SubscribeMessage('gps:subscribe')
  handleSubscribe(
    @MessageBody() payload: { companyId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload.companyId) {
      return { event: 'gps:error', data: { message: 'companyId is required' } };
    }

    client.join(`company:${payload.companyId}`);
    return { event: 'gps:subscribed', data: { companyId: payload.companyId } };
  }

  @SubscribeMessage('gps:unsubscribe')
  handleUnsubscribe(
    @MessageBody() payload: { companyId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload.companyId) {
      return { event: 'gps:error', data: { message: 'companyId is required' } };
    }

    client.leave(`company:${payload.companyId}`);
    return { event: 'gps:unsubscribed', data: { companyId: payload.companyId } };
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
