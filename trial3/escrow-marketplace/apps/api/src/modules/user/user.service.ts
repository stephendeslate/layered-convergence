import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { email: string; password: string; name: string; role: 'BUYER' | 'PROVIDER' }) {
    // Check for existing email — findFirst justified: existence check, not tenant-scoped
    const existing = await this.prisma.user.findFirst({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = crypto.createHash('sha256').update(data.password).digest('hex');

    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findFirstOrThrow({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirstOrThrow({
      where: { email },
    });
  }

  async update(id: string, data: { name?: string; email?: string }) {
    await this.prisma.user.findFirstOrThrow({ where: { id } });
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, updatedAt: true },
    });
  }
}
