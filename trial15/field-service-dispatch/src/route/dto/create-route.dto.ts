import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  waypoints!: Array<{ lat: number; lng: number; label?: string }>;

  @IsString()
  @IsNotEmpty()
  technicianId!: string;
}
