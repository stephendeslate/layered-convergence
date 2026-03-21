import { DataSourceService } from './datasource.service.js';
import { CreateDataSourceDto, CreateDataSourceConfigDto } from './dto/create-datasource.dto.js';
import { UpdateDataSourceDto, UpdateDataSourceConfigDto } from './dto/update-datasource.dto.js';
import { Request } from 'express';
export declare class DataSourceController {
    private readonly dataSourceService;
    constructor(dataSourceService: DataSourceService);
    create(req: Request, dto: CreateDataSourceDto): Promise<{
        type: import("../../generated/prisma/enums.js").DataSourceType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    findAll(req: Request): Promise<({
        config: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dataSourceId: string;
            connectionConfig: import("@prisma/client/runtime/client").JsonValue;
            fieldMapping: import("@prisma/client/runtime/client").JsonValue;
            transformSteps: import("@prisma/client/runtime/client").JsonValue;
            syncSchedule: string | null;
        } | null;
    } & {
        type: import("../../generated/prisma/enums.js").DataSourceType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    })[]>;
    findOne(req: Request, id: string): Promise<{
        config: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dataSourceId: string;
            connectionConfig: import("@prisma/client/runtime/client").JsonValue;
            fieldMapping: import("@prisma/client/runtime/client").JsonValue;
            transformSteps: import("@prisma/client/runtime/client").JsonValue;
            syncSchedule: string | null;
        } | null;
    } & {
        type: import("../../generated/prisma/enums.js").DataSourceType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    update(req: Request, id: string, dto: UpdateDataSourceDto): Promise<{
        type: import("../../generated/prisma/enums.js").DataSourceType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    remove(req: Request, id: string): Promise<{
        type: import("../../generated/prisma/enums.js").DataSourceType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    createConfig(req: Request, id: string, dto: CreateDataSourceConfigDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dataSourceId: string;
        connectionConfig: import("@prisma/client/runtime/client").JsonValue;
        fieldMapping: import("@prisma/client/runtime/client").JsonValue;
        transformSteps: import("@prisma/client/runtime/client").JsonValue;
        syncSchedule: string | null;
    }>;
    updateConfig(req: Request, id: string, dto: UpdateDataSourceConfigDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dataSourceId: string;
        connectionConfig: import("@prisma/client/runtime/client").JsonValue;
        fieldMapping: import("@prisma/client/runtime/client").JsonValue;
        transformSteps: import("@prisma/client/runtime/client").JsonValue;
        syncSchedule: string | null;
    }>;
}
