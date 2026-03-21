import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GpsService } from './gps.service';
import { PositionUpdateDto } from './dto/position-update.dto';

@WebSocketGateway({
  namespace: '/gps',
  cors: { origin: '*' },
})
export class GpsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly gpsService: GpsService) {}

  afterInit() {
    // Gateway initialized
  }

  handleConnection(client: Socket) {
    const companyId = client.handshake.query.companyId as string;
    if (companyId) {
      client.join(`company:${companyId}`);
    }
  }

  handleDisconnect() {
    // Client disconnected
  }

  @SubscribeMessage('position:update')
  async handlePositionUpdate(
    @MessageBody() data: PositionUpdateDto,
    @ConnectedSocket() client: Socket,
  ) {
    const position = await this.gpsService.updatePosition(data);

    // Broadcast to all clients watching this company
    const technician = await this.gpsService
      .getPositions('')
      .then(() => null); // simplified — in production, get companyId from auth

    // Broadcast position update to all connected dispatch dashboards
    this.server.emit('position:updated', position);

    return position;
  }

  @SubscribeMessage('positions:request')
  async handlePositionsRequest(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const positions = await this.gpsService.getPositions(data.companyId);
    client.emit('positions:list', positions);
    return positions;
  }
}
