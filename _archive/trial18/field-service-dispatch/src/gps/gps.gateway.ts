import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface PositionUpdate {
  technicianId: string;
  lat: number;
  lng: number;
}

@WebSocketGateway({ cors: true })
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const companyId = client.handshake.query['companyId'];
    if (companyId && typeof companyId === 'string') {
      client.join(`company:${companyId}`);
    }
  }

  handleDisconnect(_client: Socket) {
    // cleanup handled by socket.io room management
  }

  @SubscribeMessage('position:update')
  handlePositionUpdate(
    @MessageBody() data: PositionUpdate,
    @ConnectedSocket() client: Socket,
  ) {
    const companyId = client.handshake.query['companyId'];
    if (companyId && typeof companyId === 'string') {
      this.server.to(`company:${companyId}`).emit('position:updated', {
        technicianId: data.technicianId,
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      });
    }
    return { event: 'position:ack', data: { received: true } };
  }
}
