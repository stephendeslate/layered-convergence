export declare enum SyncRunStatus {
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class UpdateSyncRunDto {
    status: SyncRunStatus;
    rowsIngested?: number;
    errorLog?: string;
}
