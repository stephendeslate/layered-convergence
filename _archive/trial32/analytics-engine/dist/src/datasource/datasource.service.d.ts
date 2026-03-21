import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDataSourceDto, CreateDataSourceConfigDto } from './dto/create-datasource.dto.js';
import { UpdateDataSourceDto, UpdateDataSourceConfigDto } from './dto/update-datasource.dto.js';
export declare class DataSourceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateDataSourceDto): Promise<{
        type: import("../../generated/prisma/enums.js").DataSourceType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    findAll(tenantId: string): Promise<({
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
    findOne(tenantId: string, id: string): Promise<{
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
    update(tenantId: string, id: string, dto: UpdateDataSourceDto): Promise<{
        type: import("../../generated/prisma/enums.js").DataSourceType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    remove(tenantId: string, id: string): Promise<{
        type: import("../../generated/prisma/enums.js").DataSourceType;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }>;
    createConfig(tenantId: string, dataSourceId: string, dto: CreateDataSourceConfigDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dataSourceId: string;
        connectionConfig: import("@prisma/client/runtime/client").JsonValue;
        fieldMapping: import("@prisma/client/runtime/client").JsonValue;
        transformSteps: import("@prisma/client/runtime/client").JsonValue;
        syncSchedule: string | null;
    }>;
    updateConfig(tenantId: string, dataSourceId: string, dto: UpdateDataSourceConfigDto): Promise<{
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
