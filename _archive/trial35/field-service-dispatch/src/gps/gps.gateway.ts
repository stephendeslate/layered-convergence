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
import { GpsService, GpsPosition } from './gps.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, string>();

  constructor(private readonly gpsService: GpsService) {}

  handleConnection(client: Socket) {
    const companyId = client.handshake.query.companyId as string;
    if (companyId) {
      client.join(`company:${companyId}`);
      this.connectedClients.set(client.id, companyId);
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('position:update')
  async handlePositionUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GpsPosition,
  ) {
    const gpsEvent = await this.gpsService.recordPosition(data);
    const companyId = this.connectedClients.get(client.id);
    if (companyId) {
      this.server.to(`company:${companyId}`).emit('position:updated', {
        technicianId: data.technicianId,
        lat: data.lat,
        lng: data.lng,
        accuracy: data.accuracy,
        timestamp: gpsEvent.timestamp,
      });
    }
    return { success: true, eventId: gpsEvent.id };
  }

  @SubscribeMessage('position:subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string },
  ) {
    client.join(`company:${data.companyId}`);
    this.connectedClients.set(client.id, data.companyId);
    return { success: true };
  }
}
