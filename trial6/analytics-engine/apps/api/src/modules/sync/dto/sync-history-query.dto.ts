import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { SyncRunStatus } from '@prisma/client';

export class SyncHistoryQueryDto {
  @IsString()
  @IsOptional()
  dataSourceId?: string;

  @IsEnum(SyncRunStatus)
  @IsOptional()
  status?: SyncRunStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
