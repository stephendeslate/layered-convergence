import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  layout?: Record<string, unknown>[];
}
