import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';

export class CreateDashboardDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;
}
