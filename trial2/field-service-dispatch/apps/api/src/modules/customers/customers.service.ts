import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        lat: dto.lat,
        lng: dto.lng,
        notes: dto.notes,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, companyId: string) {
    return this.prisma.customer.findFirstOrThrow({
      where: { id, companyId },
      include: {
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateCustomerDto) {
    await this.prisma.customer.findFirstOrThrow({
      where: { id, companyId },
    });

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, companyId: string) {
    await this.prisma.customer.findFirstOrThrow({
      where: { id, companyId },
    });

    return this.prisma.customer.delete({ where: { id } });
  }
}
