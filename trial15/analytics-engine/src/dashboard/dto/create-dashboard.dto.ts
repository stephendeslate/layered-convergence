import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @IsOptional()
  layout?: unknown[];
}
