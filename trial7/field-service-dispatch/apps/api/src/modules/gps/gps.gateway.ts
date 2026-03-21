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

interface GpsUpdate {
  technicianId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GpsGateway.name);

  constructor(private readonly technicianService: TechnicianService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('gps:update')
  async handleGpsUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GpsUpdate,
  ) {
    this.logger.debug(
      `GPS update from ${data.technicianId}: ${data.lat}, ${data.lng}`,
    );

    // Persist latest position
    await this.technicianService.updateLocation(
      data.technicianId,
      data.lat,
      data.lng,
    );

    // Broadcast to all connected clients (dispatch dashboard, customer portal)
    this.server.emit('gps:position', {
      technicianId: data.technicianId,
      lat: data.lat,
      lng: data.lng,
      timestamp: data.timestamp,
    });

    return { event: 'gps:ack', data: { received: true } };
  }

  @SubscribeMessage('gps:subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string },
  ) {
    client.join(`company:${data.companyId}`);
    this.logger.log(`Client ${client.id} subscribed to company ${data.companyId}`);
    return { event: 'gps:subscribed', data: { companyId: data.companyId } };
  }
}
