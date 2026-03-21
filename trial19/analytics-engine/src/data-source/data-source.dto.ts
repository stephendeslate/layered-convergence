import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { DataSourceStatus } from '@prisma/client';

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  connectionString!: string;
}

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  connectionString?: string;

  @IsOptional()
  @IsIn([DataSourceStatus.ACTIVE, DataSourceStatus.INACTIVE])
  status?: DataSourceStatus;
}
