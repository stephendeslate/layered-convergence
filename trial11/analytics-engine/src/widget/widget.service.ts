import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWidgetDto } from './dto/create-widget.dto.js';
import { UpdateWidgetDto } from './dto/update-widget.dto.js';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dashboardId: string, dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        dashboardId,
        type: dto.type,
        // type assertion justified: config DTO is Record<string, unknown>, Prisma expects InputJsonValue
        config: dto.config as Prisma.InputJsonValue,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 4,
        height: dto.height ?? 3,
      },
    });
  }

  async findAll(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
    });
  }

  async findById(id: string) {
    return this.prisma.widget.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateWidgetDto) {
    const { config, ...rest } = dto;
    return this.prisma.widget.update({
      where: { id },
      data: {
        ...rest,
        // type assertion justified: config DTO is Record<string, unknown>, Prisma expects InputJsonValue
        ...(config !== undefined
          ? { config: config as Prisma.InputJsonValue }
          : {}),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.widget.delete({
      where: { id },
    });
  }
}
