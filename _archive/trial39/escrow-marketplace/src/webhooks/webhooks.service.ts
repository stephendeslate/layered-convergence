import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async createEndpoint(userId: string, dto: CreateWebhookEndpointDto) {
    const secret = randomBytes(32).toString('hex');
    return this.prisma.webhookEndpoint.create({
      data: {
        userId,
        url: dto.url,
        secret,
        events: dto.events,
      },
    });
  }

  async findEndpoints(userId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { userId },
    });
  }

  async findEndpointById(id: string) {
    const endpoint = await this.prisma.webhookEndpoint.findUnique({
      where: { id },
    });
    if (!endpoint) {
      throw new NotFoundException(`Webhook endpoint ${id} not found`);
    }
    return endpoint;
  }

  async deleteEndpoint(id: string) {
    await this.prisma.webhookEndpoint.delete({ where: { id } });
  }

  async createEvent(
    endpointId: string,
    eventType: string,
    payload: any,
    idempotencyKey: string,
  ) {
    return this.prisma.webhookEvent.create({
      data: {
        endpointId,
        eventType,
        payload,
        idempotencyKey,
      },
    });
  }

  async findEvents(endpointId: string) {
    return this.prisma.webhookEvent.findMany({
      where: { endpointId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
