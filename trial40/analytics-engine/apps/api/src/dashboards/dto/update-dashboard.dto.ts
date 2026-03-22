import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
