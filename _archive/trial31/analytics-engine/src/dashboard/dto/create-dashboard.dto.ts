import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  layout?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
