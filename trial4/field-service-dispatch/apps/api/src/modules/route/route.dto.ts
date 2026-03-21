import { IsString, IsOptional, IsArray, IsInt, IsDateString, IsNumber, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WaypointDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  label?: string;
}

export class CreateRouteDto {
  @IsString()
  technicianId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaypointDto)
  waypoints?: WaypointDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  optimizedOrder?: number[];

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDuration?: number;
}

export class OptimizeRouteDto {
  @IsString()
  technicianId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaypointDto)
  waypoints: WaypointDto[];
}
