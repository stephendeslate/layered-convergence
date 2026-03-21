import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;
}
