// TRACED:SA-005 — Webhook delivery system for event notifications
// TRACED:AC-009 — POST /webhooks registers a webhook subscription

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWebhookDto) {
    // findFirst justification: verifying transaction ownership (buyer OR seller)
    // before allowing webhook registration. findUnique cannot express OR conditions
    // on non-unique fields (buyerId, sellerId).
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: dto.transactionId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const webhook = await this.prisma.webhook.create({
      data: {
        transactionId: dto.transactionId,
        event: dto.event,
        payload: dto.payload ?? {},
      },
    });

    this.logger.log(
      `Webhook ${webhook.id} created for transaction ${dto.transactionId}`,
    );

    return webhook;
  }

  async findAllForUser(userId: string) {
    return this.prisma.webhook.findMany({
      where: {
        transaction: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
