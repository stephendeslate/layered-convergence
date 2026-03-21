import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
