import { IsString, IsDateString, IsObject } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  dataSourceId: string;

  @IsDateString()
  timestamp: string;

  @IsObject()
  dimensions: Record<string, any>;

  @IsObject()
  metrics: Record<string, any>;
}
