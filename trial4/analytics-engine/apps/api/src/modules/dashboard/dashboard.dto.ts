import { IsString, IsOptional, IsBoolean, IsObject, MinLength } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
