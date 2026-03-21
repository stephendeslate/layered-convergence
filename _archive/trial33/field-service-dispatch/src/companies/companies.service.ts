import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        serviceArea: (dto.serviceArea as Prisma.InputJsonValue) ?? undefined,
        branding: (dto.branding as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company ${id} not found`);
    }
    return company;
  }

  async findBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) {
      throw new NotFoundException(`Company with slug ${slug} not found`);
    }
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        serviceArea: (dto.serviceArea as Prisma.InputJsonValue) ?? undefined,
        branding: (dto.branding as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.company.delete({ where: { id } });
  }
}
