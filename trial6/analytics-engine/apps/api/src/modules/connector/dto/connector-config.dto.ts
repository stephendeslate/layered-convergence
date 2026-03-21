import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsArray,
} from 'class-validator';

export class ConnectorConfigDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId: string;

  @IsObject()
  connectionConfig: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  fieldMapping?: Record<string, unknown>[];

  @IsArray()
  @IsOptional()
  transformSteps?: Record<string, unknown>[];

  @IsString()
  @IsOptional()
  syncSchedule?: string;
}
