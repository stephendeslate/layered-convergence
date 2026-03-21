import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class AggregateQueryDto {
  @IsString()
  dataSourceId!: string;

  @IsIn(['hour', 'day', 'week', 'month'])
  bucket!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  metric?: string;
}
