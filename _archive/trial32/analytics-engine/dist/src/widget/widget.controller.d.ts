import { WidgetService } from './widget.service.js';
import { CreateWidgetDto } from './dto/create-widget.dto.js';
import { UpdateWidgetDto } from './dto/update-widget.dto.js';
export declare class WidgetController {
    private readonly widgetService;
    constructor(widgetService: WidgetService);
    create(dto: CreateWidgetDto): Promise<{
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
    }>;
    findAllByDashboard(dashboardId: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, dto: UpdateWidgetDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
