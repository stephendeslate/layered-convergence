import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
