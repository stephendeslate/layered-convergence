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
import { GpsService } from './gps.service';

interface LocationUpdate {
  technicianId: string;
  companyId: string;
  lat: number;
  lng: number;
  timestamp?: number;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedClients = new Map<string, string>();

  constructor(private readonly gpsService: GpsService) {}

  handleConnection(client: Socket): void {
    const companyId = client.handshake.query.companyId as string;
    if (companyId) {
      client.join(`company:${companyId}`);
      this.connectedClients.set(client.id, companyId);
    }
  }

  handleDisconnect(client: Socket): void {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @MessageBody() data: LocationUpdate,
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean }> {
    await this.gpsService.updateLocation(
      data.companyId,
      data.technicianId,
      data.lat,
      data.lng,
    );

    this.server.to(`company:${data.companyId}`).emit('location:updated', {
      technicianId: data.technicianId,
      lat: data.lat,
      lng: data.lng,
      timestamp: data.timestamp || Date.now(),
    });

    return { success: true };
  }

  @SubscribeMessage('location:subscribe')
  handleSubscribe(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`company:${data.companyId}`);
  }

  broadcastLocation(
    companyId: string,
    technicianId: string,
    lat: number,
    lng: number,
  ): void {
    this.server.to(`company:${companyId}`).emit('location:updated', {
      technicianId,
      lat,
      lng,
      timestamp: Date.now(),
    });
  }

  getConnectedClientCount(): number {
    return this.connectedClients.size;
  }
}
