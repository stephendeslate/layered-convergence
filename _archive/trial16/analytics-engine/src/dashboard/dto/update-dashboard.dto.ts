import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  layout?: any[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
