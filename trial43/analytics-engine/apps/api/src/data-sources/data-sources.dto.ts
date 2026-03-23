import { IsString, MaxLength, IsOptional, IsObject, IsIn, IsNumber } from 'class-validator';

// TRACED:AE-API-004
export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(20)
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV', 'S3'])
  type!: string;

  @IsString()
  @MaxLength(500)
  connectionUri!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsNumber()
  monthlyCost!: number;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['CONNECTED', 'DISCONNECTED', 'ERROR'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  connectionUri?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  monthlyCost?: number;
}
