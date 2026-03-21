import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsArray()
  @IsOptional()
  layout?: Record<string, unknown>[];
}
