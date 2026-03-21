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
  server!: Server;

  constructor(private readonly gpsService: GpsService) {}

  handleConnection(client: Socket) {
    const companyId = client.handshake.query['companyId'] as string;
    if (companyId) {
      client.join(`company:${companyId}`);
    }
  }

  handleDisconnect(_client: Socket) {
    // cleanup handled by socket.io
  }

  @SubscribeMessage('position:update')
  async handlePositionUpdate(
    @MessageBody() data: GpsPosition,
    @ConnectedSocket() client: Socket,
  ) {
    const updated = await this.gpsService.updatePosition(data);
    const companyId = updated.companyId;

    this.server.to(`company:${companyId}`).emit('position:updated', {
      technicianId: updated.id,
      name: updated.name,
      lat: updated.currentLat,
      lng: updated.currentLng,
      timestamp: Date.now(),
    });

    return { event: 'position:ack', data: { success: true } };
  }

  @SubscribeMessage('company:join')
  handleJoinCompany(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`company:${data.companyId}`);
    return { event: 'company:joined', data: { companyId: data.companyId } };
  }
}
