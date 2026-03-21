import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  layout?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
