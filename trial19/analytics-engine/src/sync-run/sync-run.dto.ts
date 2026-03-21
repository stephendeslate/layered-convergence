import { IsNotEmpty, IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { SyncRunStatus } from '@prisma/client';

export class CreateSyncRunDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;
}

export class TransitionSyncRunDto {
  @IsIn([SyncRunStatus.PENDING, SyncRunStatus.RUNNING, SyncRunStatus.COMPLETED, SyncRunStatus.FAILED])
  status!: SyncRunStatus;

  @IsOptional()
  @IsInt()
  recordsProcessed?: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
