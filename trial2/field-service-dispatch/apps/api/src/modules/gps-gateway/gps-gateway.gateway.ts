import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload, PositionUpdate, UserRole } from '@field-service/shared';

@WebSocketGateway({
  namespace: '/gps',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class GpsGatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GpsGatewayGateway.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Connection rejected: no token provided (${client.id})`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = payload;
      client.data.companyId = payload.companyId;

      await client.join(`company:${payload.companyId}`);
      this.logger.log(
        `Client connected: ${client.id} (company: ${payload.companyId}, role: ${payload.role})`,
      );
    } catch {
      this.logger.warn(`Connection rejected: invalid token (${client.id})`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('position:update')
  async handlePositionUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number; heading?: number; speed?: number },
  ) {
    const user = client.data.user as JwtPayload;
    if (!user) {
      throw new WsException('Unauthorized');
    }

    if (user.role !== UserRole.TECHNICIAN) {
      throw new WsException('Only technicians can send position updates');
    }

    const technician = await this.prisma.technician.findFirst({
      where: { userId: user.sub, companyId: user.companyId },
    });

    if (!technician) {
      throw new WsException('Technician profile not found');
    }

    await this.prisma.technician.update({
      where: { id: technician.id },
      data: { currentLat: data.lat, currentLng: data.lng },
    });

    const positionUpdate: PositionUpdate = {
      technicianId: technician.id,
      lat: data.lat,
      lng: data.lng,
      heading: data.heading ?? null,
      speed: data.speed ?? null,
      timestamp: new Date().toISOString(),
    };

    this.server
      .to(`company:${user.companyId}`)
      .emit('position:updated', positionUpdate);

    return { success: true };
  }

  @SubscribeMessage('tracking:subscribe')
  async handleTrackingSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { trackingToken: string },
  ) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { trackingToken: data.trackingToken },
      select: { id: true, companyId: true },
    });

    if (!workOrder) {
      throw new WsException('Invalid tracking token');
    }

    await client.join(`tracking:${data.trackingToken}`);
    return { success: true };
  }

  broadcastToCompany(companyId: string, event: string, data: unknown) {
    this.server.to(`company:${companyId}`).emit(event, data);
  }

  broadcastToTracking(trackingToken: string, event: string, data: unknown) {
    this.server.to(`tracking:${trackingToken}`).emit(event, data);
  }
}
