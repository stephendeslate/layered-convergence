import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  layout?: unknown[];
}
