import { Request } from 'express';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
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
    findAll(req: Request): Promise<{
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
    findOne(id: string, req: Request): Promise<{
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
    update(id: string, dto: UpdateCustomerDto, req: Request): Promise<{
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
    remove(id: string, req: Request): Promise<{
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
