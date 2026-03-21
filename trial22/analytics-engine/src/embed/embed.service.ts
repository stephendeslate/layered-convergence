// [TRACED:AC-015] Embed service with token generation and expiry

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Embed } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<Embed[]> {
    return this.prisma.embed.findMany({ where: { tenantId } });
  }

  async findByToken(token: string): Promise<Embed | null> {
    return this.prisma.embed.findUnique({ where: { token } });
  }

  async create(
    data: { config?: object; tenantId: string; expiresAt: Date },
  ): Promise<Embed> {
    return this.prisma.embed.create({
      data: {
        token: randomUUID(),
        config: data.config ?? {},
        tenantId: data.tenantId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async remove(id: string, tenantId: string): Promise<Embed> {
    return this.prisma.embed.delete({ where: { id, tenantId } });
  }
}
