import { IsUUID, IsDateString, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreateRouteDto {
  @IsUUID()
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsArray()
  waypoints!: Array<{ lat: number; lng: number; label?: string }>;

  @IsOptional()
  @IsInt()
  estimatedDuration?: number;
}
