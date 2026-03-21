import { IsUUID, IsDateString, IsArray, IsOptional, IsInt } from 'class-validator';

export class CreateRouteDto {
  @IsUUID()
  technicianId: string;

  @IsDateString()
  date: string;

  @IsArray()
  waypoints: any[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  optimizedOrder?: number[];

  @IsInt()
  @IsOptional()
  estimatedDuration?: number;
}
