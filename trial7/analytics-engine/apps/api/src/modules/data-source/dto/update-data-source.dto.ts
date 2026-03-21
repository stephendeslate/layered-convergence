import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
