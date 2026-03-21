import { IsUUID, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class GpsPositionDto {
  @IsUUID()
  technicianId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;
}
