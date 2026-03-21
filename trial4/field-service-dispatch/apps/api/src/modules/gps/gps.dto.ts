import { IsNumber } from 'class-validator';

export class UpdateGpsPositionDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
