import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  layout?: Record<string, unknown>[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
