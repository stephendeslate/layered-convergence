import { DashboardService } from './dashboard.service.js';
import { CreateDashboardDto } from './dto/create-dashboard.dto.js';
import { UpdateDashboardDto } from './dto/update-dashboard.dto.js';
import { Request } from 'express';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    create(req: Request, dto: CreateDashboardDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        layout: import("@prisma/client/runtime/client").JsonValue;
        isPublished: boolean;
    }>;
    findAll(req: Request): Promise<({
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
    findOne(req: Request, id: string): Promise<{
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
    update(req: Request, id: string, dto: UpdateDashboardDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        layout: import("@prisma/client/runtime/client").JsonValue;
        isPublished: boolean;
    }>;
    remove(req: Request, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        layout: import("@prisma/client/runtime/client").JsonValue;
        isPublished: boolean;
    }>;
}
