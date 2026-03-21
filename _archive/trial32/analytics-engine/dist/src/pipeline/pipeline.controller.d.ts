import { PipelineService } from './pipeline.service.js';
import { UpdateSyncRunDto } from './dto/update-sync-run.dto.js';
import { Request } from 'express';
export declare class PipelineController {
    private readonly pipelineService;
    constructor(pipelineService: PipelineService);
    startSync(req: Request, dataSourceId: string): Promise<{
        id: string;
        dataSourceId: string;
        status: import("../../generated/prisma/enums.js").SyncRunStatus;
        rowsIngested: number;
        errorLog: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    updateSyncStatus(id: string, dto: UpdateSyncRunDto): Promise<{
        id: string;
        dataSourceId: string;
        status: import("../../generated/prisma/enums.js").SyncRunStatus;
        rowsIngested: number;
        errorLog: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    getSyncRun(id: string): Promise<{
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
