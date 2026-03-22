import { IsString, MaxLength, IsIn, IsOptional, IsNumber } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  @IsIn(['DATABASE', 'API', 'FILE', 'STREAM'])
  type?: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  cost?: number;
}
