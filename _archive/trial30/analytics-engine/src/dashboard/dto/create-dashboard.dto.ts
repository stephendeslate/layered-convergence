import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
