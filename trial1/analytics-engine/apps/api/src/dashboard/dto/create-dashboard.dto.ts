import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(24)
  @IsOptional()
  gridColumns?: number;
}
