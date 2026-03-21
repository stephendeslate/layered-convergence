import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
export declare class CustomerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCustomerDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        address: string;
        lat: import("@prisma/client/runtime/library").Decimal | null;
        lng: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAllByCompany(companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        address: string;
        lat: import("@prisma/client/runtime/library").Decimal | null;
        lng: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    findOne(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        address: string;
        lat: import("@prisma/client/runtime/library").Decimal | null;
        lng: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: string, companyId: string, dto: UpdateCustomerDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        address: string;
        lat: import("@prisma/client/runtime/library").Decimal | null;
        lng: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        address: string;
        lat: import("@prisma/client/runtime/library").Decimal | null;
        lng: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
