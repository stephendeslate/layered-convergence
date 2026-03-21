import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  layout?: any[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
