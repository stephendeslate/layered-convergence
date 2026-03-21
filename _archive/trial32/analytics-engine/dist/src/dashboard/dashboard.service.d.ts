import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDashboardDto } from './dto/create-dashboard.dto.js';
import { UpdateDashboardDto } from './dto/update-dashboard.dto.js';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateDashboardDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        layout: import("@prisma/client/runtime/client").JsonValue;
        isPublished: boolean;
    }>;
    findAll(tenantId: string): Promise<({
        widgets: {
            type: import("../../generated/prisma/enums.js").WidgetType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dashboardId: string;
            config: import("@prisma/client/runtime/client").JsonValue;
            positionX: number;
            positionY: number;
            width: number;
            height: number;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        layout: import("@prisma/client/runtime/client").JsonValue;
        isPublished: boolean;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        widgets: {
            type: import("../../generated/prisma/enums.js").WidgetType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dashboardId: string;
            config: import("@prisma/client/runtime/client").JsonValue;
            positionX: number;
            positionY: number;
            width: number;
            height: number;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        layout: import("@prisma/client/runtime/client").JsonValue;
        isPublished: boolean;
    }>;
    update(tenantId: string, id: string, dto: UpdateDashboardDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        layout: import("@prisma/client/runtime/client").JsonValue;
        isPublished: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        layout: import("@prisma/client/runtime/client").JsonValue;
        isPublished: boolean;
    }>;
}
