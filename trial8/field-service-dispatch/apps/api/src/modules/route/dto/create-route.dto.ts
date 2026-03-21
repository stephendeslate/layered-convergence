import { IsString, IsDateString, IsArray, IsOptional } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsArray()
  waypoints!: { lat: number; lng: number; workOrderId: string }[];
}
