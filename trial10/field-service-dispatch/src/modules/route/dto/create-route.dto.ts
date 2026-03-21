import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsArray()
  waypoints?: Record<string, unknown>[];
}

export class OptimizeRouteDto {
  @IsString()
  technicianId!: string;

  @IsDateString()
  date!: string;
}
