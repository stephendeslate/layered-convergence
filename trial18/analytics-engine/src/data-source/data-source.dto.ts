import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { DataSourceType } from '@prisma/client';

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(DataSourceType)
  type!: DataSourceType;

  @IsObject()
  config!: Record<string, unknown>;

  @IsString()
  @IsOptional()
  syncFrequency?: string;
}

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  syncFrequency?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
