import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class PositionUpdateDto {
  @IsString()
  @IsNotEmpty()
  technicianId: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class PositionBroadcastDto {
  technicianId: string;
  lat: number;
  lng: number;
  timestamp: string;
}
