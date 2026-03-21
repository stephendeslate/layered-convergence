import { IsString, IsDateString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsArray()
  waypoints?: Record<string, unknown>[];

  @IsOptional()
  @IsInt()
  estimatedDuration?: number;
}
