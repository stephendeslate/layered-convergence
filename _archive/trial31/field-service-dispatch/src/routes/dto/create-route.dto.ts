import {
  IsUUID,
  IsDateString,
  IsArray,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateRouteDto {
  @IsUUID()
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsArray()
  @IsObject({ each: true })
  waypoints!: Record<string, unknown>[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  optimizedOrder?: number[];

  @IsNumber()
  @IsOptional()
  estimatedDuration?: number;
}
