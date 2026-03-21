import { IsString, IsIn, IsDateString } from 'class-validator';

export class AggregateQueryDto {
  @IsString()
  dataSourceId!: string;

  @IsIn(['hourly', 'daily', 'weekly'])
  granularity!: 'hourly' | 'daily' | 'weekly';

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
