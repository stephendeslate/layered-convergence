import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsArray()
  waypoints!: Array<{ lat: number; lng: number; workOrderId?: string }>;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  optimizedOrder?: number[];

  @IsNumber()
  @IsOptional()
  estimatedDuration?: number;
}
