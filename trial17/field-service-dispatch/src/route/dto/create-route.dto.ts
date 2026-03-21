import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, IsNumber } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsOptional()
  technicianId?: string;

  @IsArray()
  @IsOptional()
  workOrderIds?: string[];
}

export class OptimizeRouteDto {
  @IsString()
  @IsNotEmpty()
  technicianId!: string;

  @IsArray()
  @IsString({ each: true })
  workOrderIds!: string[];

  @IsNumber()
  @IsOptional()
  startLatitude?: number;

  @IsNumber()
  @IsOptional()
  startLongitude?: number;
}
