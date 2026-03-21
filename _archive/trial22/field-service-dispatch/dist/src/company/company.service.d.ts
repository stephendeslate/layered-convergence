import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
export declare class CompanyService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCompanyDto): Promise<{
        id: string;
        name: string;
        serviceArea: string | null;
        primaryColor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        serviceArea: string | null;
        primaryColor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        serviceArea: string | null;
        primaryColor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateCompanyDto): Promise<{
        id: string;
        name: string;
        serviceArea: string | null;
        primaryColor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        serviceArea: string | null;
        primaryColor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
