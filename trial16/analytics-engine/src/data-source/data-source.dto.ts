import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @IsIn(['hourly', 'daily', 'weekly', 'monthly', 'manual'])
  syncFrequency?: string;
}

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'error'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['hourly', 'daily', 'weekly', 'monthly', 'manual'])
  syncFrequency?: string;
}
