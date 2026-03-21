import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransformationDto } from './dto/create-transformation.dto';
import { UpdateTransformationDto } from './dto/update-transformation.dto';

@Injectable()
export class TransformationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dataSourceId: string) {
    return this.prisma.transformation.findMany({
      where: { dataSourceId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const transformation = await this.prisma.transformation.findUnique({
      where: { id },
    });
    if (!transformation)
      throw new NotFoundException('Transformation not found');
    return transformation;
  }

  async create(dto: CreateTransformationDto) {
    return this.prisma.transformation.create({
      data: {
        name: dto.name,
        type: dto.type,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        order: dto.order ?? 0,
        dataSourceId: dto.dataSourceId,
      },
    });
  }

  async update(id: string, dto: UpdateTransformationDto) {
    return this.prisma.transformation.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        config: dto.config as Prisma.InputJsonValue,
        order: dto.order,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.transformation.delete({ where: { id } });
  }
}
