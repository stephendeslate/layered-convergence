import { IsUUID, IsDateString, IsArray, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateRouteDto {
  @IsUUID()
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsArray()
  waypoints!: Array<{ lat: number; lng: number; workOrderId?: string }>;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  optimizedOrder?: number[];

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;
}
