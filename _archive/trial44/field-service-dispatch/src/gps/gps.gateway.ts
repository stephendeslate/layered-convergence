import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GpsService } from './gps.service';

@WebSocketGateway({ namespace: '/gps', cors: { origin: '*' } })
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gpsService: GpsService) {}

  handleConnection(client: Socket) {
    const companyId = client.handshake.query.companyId as string;
    if (companyId) {
      client.join(`company:${companyId}`);
    }
  }

  handleDisconnect(client: Socket) {
    // cleanup handled automatically by socket.io
  }

  @SubscribeMessage('position:update')
  async handlePositionUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string; technicianId: string; lat: number; lng: number; accuracy?: number },
  ) {
    try {
      const event = await this.gpsService.recordPosition(data.companyId, {
        technicianId: data.technicianId,
        lat: data.lat,
        lng: data.lng,
        accuracy: data.accuracy,
      });

      this.server.to(`company:${data.companyId}`).emit('position:updated', {
        technicianId: data.technicianId,
        lat: data.lat,
        lng: data.lng,
        accuracy: data.accuracy,
        timestamp: event.timestamp,
      });

      return { status: 'ok', eventId: event.id };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('company:join')
  handleJoinCompany(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string },
  ) {
    client.join(`company:${data.companyId}`);
    return { status: 'joined', room: `company:${data.companyId}` };
  }
}
