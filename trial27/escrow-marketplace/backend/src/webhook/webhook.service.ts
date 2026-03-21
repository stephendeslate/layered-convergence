import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { url: string; secret: string; events: string[] }) {
    return this.prisma.webhook.create({ data });
  }

  async findAll() {
    return this.prisma.webhook.findMany({ where: { active: true } });
  }
}
