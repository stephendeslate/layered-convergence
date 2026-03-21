import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  layout?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  layout?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
