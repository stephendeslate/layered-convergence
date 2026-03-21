import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';

interface PositionUpdate {
  technicianId: string;
  lat: number;
  lng: number;
}

@WebSocketGateway({ cors: true })
export class GpsGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('position-update')
  async handlePositionUpdate(
    @MessageBody() data: PositionUpdate,
    @ConnectedSocket() client: Socket,
  ) {
    await this.prisma.technician.update({
      where: { id: data.technicianId },
      data: {
        currentLat: data.lat,
        currentLng: data.lng,
      },
    });

    this.server.emit('position:updated', {
      technicianId: data.technicianId,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    });

    return { event: 'position:updated', data: { success: true } };
  }
}
