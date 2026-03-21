import { EmbedService } from './embed.service.js';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto.js';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto.js';
export declare class EmbedController {
    private readonly embedService;
    constructor(embedService: EmbedService);
    createConfig(dto: CreateEmbedConfigDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dashboardId: string;
        allowedOrigins: string[];
        themeOverrides: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getConfig(dashboardId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dashboardId: string;
        allowedOrigins: string[];
        themeOverrides: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateConfig(dashboardId: string, dto: UpdateEmbedConfigDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dashboardId: string;
        allowedOrigins: string[];
        themeOverrides: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    renderByApiKey(apiKey: string): Promise<{
        tenant: {
            name: string;
            primaryColor: string | null;
            fontFamily: string | null;
            logoUrl: string | null;
        };
        dashboards: ({
            embedConfig: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                dashboardId: string;
                allowedOrigins: string[];
                themeOverrides: import("@prisma/client/runtime/client").JsonValue | null;
            } | null;
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
        })[];
    }>;
}
