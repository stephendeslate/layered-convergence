import { IsString, MaxLength, IsIn, IsOptional, IsNumber } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(36)
  @IsIn(['DATABASE', 'API', 'FILE', 'STREAM'])
  type: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
