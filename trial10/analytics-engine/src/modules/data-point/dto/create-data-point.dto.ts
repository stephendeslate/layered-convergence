import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  dataSourceId!: string;

  @IsDateString()
  timestamp!: string;

  @IsOptional()
  dimensions?: Record<string, unknown>;

  @IsOptional()
  metrics?: Record<string, number>;
}
