import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}
