import { Request } from 'express';
import { TechnicianService } from './technician.service.js';
import { CreateTechnicianDto } from './dto/create-technician.dto.js';
import { UpdateTechnicianDto } from './dto/update-technician.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';
export declare class TechnicianController {
    private readonly technicianService;
    constructor(technicianService: TechnicianService);
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
    findAll(req: Request): Promise<{
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
    findOne(id: string, req: Request): Promise<{
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
    update(id: string, dto: UpdateTechnicianDto, req: Request): Promise<{
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
    updatePosition(id: string, dto: UpdatePositionDto, req: Request): Promise<{
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
    remove(id: string, req: Request): Promise<{
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
