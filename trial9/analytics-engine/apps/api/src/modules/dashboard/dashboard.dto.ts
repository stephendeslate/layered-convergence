import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
