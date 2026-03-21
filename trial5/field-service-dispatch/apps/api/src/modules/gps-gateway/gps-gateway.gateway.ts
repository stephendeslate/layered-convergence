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
import { Logger } from '@nestjs/common';
import { GpsGatewayService, GpsPosition } from './gps-gateway.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GpsGateway.name);

  constructor(private readonly gpsService: GpsGatewayService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('position:update')
  async handlePositionUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { technicianId: string; lat: number; lng: number },
  ) {
    const position: GpsPosition = {
      technicianId: data.technicianId,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date(),
    };

    await this.gpsService.updatePosition(position);

    // Broadcast to all connected clients (dispatch dashboard + customer portals)
    this.server.emit('position:updated', position);

    return { event: 'position:ack', data: { received: true } };
  }

  @SubscribeMessage('positions:subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    const positions = this.gpsService.getAllPositions();
    client.emit('positions:snapshot', positions);
  }
}
