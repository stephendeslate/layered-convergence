import { IsString, IsOptional, IsDateString } from 'class-validator';

export class TriggerSyncDto {
  @IsString()
  dataSourceId!: string;
}

export class BackfillDto {
  @IsString()
  dataSourceId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
