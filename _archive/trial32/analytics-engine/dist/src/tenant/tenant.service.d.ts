import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
export declare class TenantService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTenantDto): Promise<{
        id: string;
        name: string;
        apiKey: string;
        primaryColor: string | null;
        fontFamily: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        apiKey: string;
        primaryColor: string | null;
        fontFamily: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        apiKey: string;
        primaryColor: string | null;
        fontFamily: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByApiKey(apiKey: string): Promise<{
        id: string;
        name: string;
        apiKey: string;
        primaryColor: string | null;
        fontFamily: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateTenantDto): Promise<{
        id: string;
        name: string;
        apiKey: string;
        primaryColor: string | null;
        fontFamily: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        apiKey: string;
        primaryColor: string | null;
        fontFamily: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    regenerateApiKey(id: string): Promise<{
        id: string;
        name: string;
        apiKey: string;
        primaryColor: string | null;
        fontFamily: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
