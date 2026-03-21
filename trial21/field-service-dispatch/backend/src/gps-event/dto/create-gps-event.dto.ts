import { IsString, IsNumber } from 'class-validator';

// [TRACED:AC-010] GPS event DTO with Float lat/lng coordinates
export class CreateGpsEventDto {
  @IsString()
  technicianId: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
