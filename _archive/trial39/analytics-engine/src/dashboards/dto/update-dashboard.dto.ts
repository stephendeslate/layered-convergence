import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  layout?: any;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
