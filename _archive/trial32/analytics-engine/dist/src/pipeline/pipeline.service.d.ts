import { PrismaService } from '../prisma/prisma.service.js';
import { SyncRunStatus } from './dto/update-sync-run.dto.js';
export declare class PipelineService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    startSync(tenantId: string, dataSourceId: string): Promise<{
        id: string;
        dataSourceId: string;
        status: import("../../generated/prisma/enums.js").SyncRunStatus;
        rowsIngested: number;
        errorLog: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    updateSyncStatus(id: string, status: SyncRunStatus, rowsIngested?: number, errorLog?: string): Promise<{
        id: string;
        dataSourceId: string;
        status: import("../../generated/prisma/enums.js").SyncRunStatus;
        rowsIngested: number;
        errorLog: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    getSyncRuns(dataSourceId: string): Promise<{
        id: string;
        dataSourceId: string;
        status: import("../../generated/prisma/enums.js").SyncRunStatus;
        rowsIngested: number;
        errorLog: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }[]>;
    getSyncRun(id: string): Promise<{
        id: string;
        dataSourceId: string;
        status: import("../../generated/prisma/enums.js").SyncRunStatus;
        rowsIngested: number;
        errorLog: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    createDeadLetterEvent(dataSourceId: string, payload: Record<string, any>, errorReason: string): Promise<{
        id: string;
        createdAt: Date;
        dataSourceId: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        errorReason: string;
        retriedAt: Date | null;
    }>;
    getDeadLetterEvents(dataSourceId: string): Promise<{
        id: string;
        createdAt: Date;
        dataSourceId: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        errorReason: string;
        retriedAt: Date | null;
    }[]>;
    retryDeadLetterEvent(id: string): Promise<{
        id: string;
        createdAt: Date;
        dataSourceId: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        errorReason: string;
        retriedAt: Date | null;
    }>;
}
