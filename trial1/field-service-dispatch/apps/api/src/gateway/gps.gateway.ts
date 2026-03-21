import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { GpsHistoryService } from './gps-history.service';
import type { JwtPayload } from '../auth/jwt.strategy';

interface GpsPositionPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: string;
}

@WebSocketGateway({
  namespace: '/gps',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GpsGateway.name);

  // Map socket IDs to user info
  private readonly connectedUsers = new Map<
    string,
    { userId: string; companyId: string; role: string; technicianId?: string }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly gpsHistory: GpsHistoryService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token as string);

      // Look up technician if the user is a technician
      let technicianId: string | undefined;
      if (payload.role === 'TECHNICIAN') {
        const tech = await this.prisma.technician.findUnique({
          where: { userId: payload.sub },
          select: { id: true },
        });
        technicianId = tech?.id;
      }

      this.connectedUsers.set(client.id, {
        userId: payload.sub,
        companyId: payload.companyId,
        role: payload.role,
        technicianId,
      });

      // Join company room for receiving all GPS updates in the company
      await client.join(`company:${payload.companyId}`);

      // If technician, also join their personal room
      if (technicianId) {
        await client.join(`technician:${technicianId}`);
      }

      this.logger.log(
        `Client ${client.id} connected: user=${payload.sub}, company=${payload.companyId}, role=${payload.role}`,
      );
    } catch (err: any) {
      this.logger.warn(`Client ${client.id} auth failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.logger.log(`Client ${client.id} disconnected: user=${user.userId}`);
      this.connectedUsers.delete(client.id);
    }
  }

  /**
   * Technician sends GPS position.
   * Server stores in Redis + DB, then broadcasts to company room.
   */
  @SubscribeMessage('gps:update')
  async handleGpsUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GpsPositionPayload,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user || !user.technicianId) {
      return { error: 'Not authorized as technician' };
    }

    const { companyId, technicianId } = user;

    try {
      // Store latest position in Redis for fast lookups
      const positionData = JSON.stringify({
        technicianId,
        ...data,
      });
      await this.redis.hset(
        `gps:${companyId}`,
        technicianId,
        positionData,
      );

      // Update technician's current position in database
      await this.prisma.technician.update({
        where: { id: technicianId },
        data: {
          currentLatitude: data.latitude,
          currentLongitude: data.longitude,
          lastPositionAt: new Date(data.timestamp),
        },
      });

      // Buffer position for batch insert (high-volume, ~1000/technician/day)
      this.gpsHistory.addPosition({
        companyId,
        technicianId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        heading: data.heading,
        speed: data.speed,
        recordedAt: new Date(data.timestamp),
      });

      // Broadcast to all dashboards in the company room
      this.server.to(`company:${companyId}`).emit('gps:position', {
        technicianId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        heading: data.heading,
        speed: data.speed,
        timestamp: data.timestamp,
      });

      return { success: true };
    } catch (err: any) {
      this.logger.error(`GPS update failed for technician ${technicianId}: ${err.message}`);
      return { error: 'Failed to process GPS update' };
    }
  }

  /**
   * Client subscribes to a specific technician's GPS updates.
   * Used by customer tracking portal.
   */
  @SubscribeMessage('gps:subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { technicianId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) {
      return { error: 'Not authenticated' };
    }

    await client.join(`technician:${data.technicianId}`);
    this.logger.log(
      `Client ${client.id} subscribed to technician ${data.technicianId}`,
    );

    // Send last known position from Redis
    const lastPosition = await this.redis.hget(
      `gps:${user.companyId}`,
      data.technicianId,
    );

    if (lastPosition) {
      client.emit('gps:position', JSON.parse(lastPosition));
    }

    return { success: true };
  }

  /**
   * Get the count of connected WebSocket clients.
   */
  getConnectionCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if the gateway is healthy (has a valid server instance).
   */
  isHealthy(): boolean {
    return !!this.server;
  }
}
