import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, type: string, title: string, body: string) {
    return this.prisma.notification.create({
      data: { companyId, userId, type, title, body },
    });
  }

  async findAll(query: NotificationQueryDto) {
    return this.prisma.notification.findMany({
      where: {
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
