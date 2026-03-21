import { IsString, IsObject, IsDateString, IsOptional } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  dataSourceId: string;

  @IsDateString()
  timestamp: string;

  @IsObject()
  @IsOptional()
  dimensions?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metrics?: Record<string, any>;
}
