import { IsEnum, IsOptional, IsInt, IsString } from 'class-validator';

export enum SyncRunStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class UpdateSyncRunDto {
  @IsEnum(SyncRunStatus)
  status: SyncRunStatus;

  @IsOptional()
  @IsInt()
  rowsIngested?: number;

  @IsOptional()
  @IsString()
  errorLog?: string;
}
