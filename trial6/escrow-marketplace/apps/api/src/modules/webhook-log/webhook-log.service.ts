import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { WebhookLogQueryDto } from './dto/webhook-log-query.dto';

@Injectable()
export class WebhookLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: WebhookLogQueryDto) {
    return this.prisma.webhookLog.findMany({
      where: query.eventType ? { eventType: query.eventType } : undefined,
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 50,
    });
  }

  async findOne(id: string) {
    return this.prisma.webhookLog.findFirstOrThrow({ where: { id } });
  }
}
