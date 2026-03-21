import { IsUUID, IsDateString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateRouteDto {
  @IsUUID()
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsArray()
  waypoints!: Array<{ lat: number; lng: number; workOrderId?: string }>;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;
}
