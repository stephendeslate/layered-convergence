import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsDateString } from 'class-validator';

export class WaypointDto {
  latitude!: number;
  longitude!: number;
  workOrderId?: string;
  order!: number;
}

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsArray()
  waypoints?: WaypointDto[];
}

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsArray()
  waypoints?: WaypointDto[];

  @IsOptional()
  @IsNumber()
  distance?: number;

  @IsOptional()
  @IsNumber()
  estimatedTime?: number;
}
