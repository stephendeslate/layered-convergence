import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTechnicianDto } from './dto/create-technician.dto.js';
import { UpdateTechnicianDto } from './dto/update-technician.dto.js';
export declare class TechnicianService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTechnicianDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string;
        skills: string[];
        phone: string | null;
        currentLat: import("@prisma/client/runtime/library").Decimal | null;
        currentLng: import("@prisma/client/runtime/library").Decimal | null;
        status: import("../../generated/prisma/enums.js").TechnicianStatus;
    }>;
    findAllByCompany(companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string;
        skills: string[];
        phone: string | null;
        currentLat: import("@prisma/client/runtime/library").Decimal | null;
        currentLng: import("@prisma/client/runtime/library").Decimal | null;
        status: import("../../generated/prisma/enums.js").TechnicianStatus;
    }[]>;
    findOne(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string;
        skills: string[];
        phone: string | null;
        currentLat: import("@prisma/client/runtime/library").Decimal | null;
        currentLng: import("@prisma/client/runtime/library").Decimal | null;
        status: import("../../generated/prisma/enums.js").TechnicianStatus;
    }>;
    update(id: string, companyId: string, dto: UpdateTechnicianDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string;
        skills: string[];
        phone: string | null;
        currentLat: import("@prisma/client/runtime/library").Decimal | null;
        currentLng: import("@prisma/client/runtime/library").Decimal | null;
        status: import("../../generated/prisma/enums.js").TechnicianStatus;
    }>;
    updatePosition(id: string, companyId: string, lat: number, lng: number): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string;
        skills: string[];
        phone: string | null;
        currentLat: import("@prisma/client/runtime/library").Decimal | null;
        currentLng: import("@prisma/client/runtime/library").Decimal | null;
        status: import("../../generated/prisma/enums.js").TechnicianStatus;
    }>;
    remove(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        email: string;
        skills: string[];
        phone: string | null;
        currentLat: import("@prisma/client/runtime/library").Decimal | null;
        currentLng: import("@prisma/client/runtime/library").Decimal | null;
        status: import("../../generated/prisma/enums.js").TechnicianStatus;
    }>;
}
