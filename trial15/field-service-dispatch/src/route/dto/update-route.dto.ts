import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  waypoints?: Array<{ lat: number; lng: number; label?: string }>;
}
