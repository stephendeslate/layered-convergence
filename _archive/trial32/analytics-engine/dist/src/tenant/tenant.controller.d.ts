import { TenantService } from './tenant.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
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
