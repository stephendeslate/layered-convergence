import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyContext: CompanyContextService,
  ) {}

  async findAll(companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    // findFirst used instead of findUnique: companyId scoping requires compound where (no unique on id+companyId)
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async create(dto: CreateCustomerDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    // findFirst justification: need compound where on id + companyId for tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    // findFirst justification: need compound where on id + companyId for tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return this.prisma.customer.delete({ where: { id } });
  }
}
