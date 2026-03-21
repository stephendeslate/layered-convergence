import { IsString, IsDateString, IsOptional, IsObject } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  dataSourceId!: string;

  @IsDateString()
  timestamp!: string;

  @IsOptional()
  @IsObject()
  dimensions?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, number>;
}
