import { IsString, IsDateString, IsObject, IsOptional } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  dataSourceId!: string;

  @IsDateString()
  timestamp!: string;

  @IsOptional()
  @IsObject()
  dimensions?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;
}
