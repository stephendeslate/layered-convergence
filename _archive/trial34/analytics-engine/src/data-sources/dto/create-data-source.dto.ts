import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
