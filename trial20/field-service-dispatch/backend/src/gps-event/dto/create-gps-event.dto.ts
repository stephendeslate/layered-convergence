import { IsString, IsNumber } from 'class-validator';

export class CreateGpsEventDto {
  @IsString()
  technicianId: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
