import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class TriggerSyncDto {
  @IsUUID()
  dataSourceId: string;

  @IsOptional()
  @IsDateString()
  backfillFrom?: string;

  @IsOptional()
  @IsDateString()
  backfillTo?: string;
}
