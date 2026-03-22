// TRACED:AE-API-04 — CreateDashboardDto with @IsString, @MaxLength, UUID @MaxLength(36)

import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsString()
  @MaxLength(36)
  createdById!: string;
}
