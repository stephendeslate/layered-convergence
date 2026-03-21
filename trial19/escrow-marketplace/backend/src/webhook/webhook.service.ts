import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWebhookDto) {
    return this.prisma.webhook.create({
      data: {
        url: dto.url,
        eventType: dto.eventType,
        secret: dto.secret,
      },
    });
  }

  async findAll() {
    return this.prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    // findUnique: id is the primary key (@id)
    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async delete(id: string) {
    // findUnique: id is the primary key (@id)
    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhook.delete({
      where: { id },
    });
  }
}
