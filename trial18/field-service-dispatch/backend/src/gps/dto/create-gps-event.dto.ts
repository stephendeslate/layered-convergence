import { IsDateString, IsNumber, IsUUID } from 'class-validator';

export class CreateGpsEventDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsDateString()
  timestamp!: string;

  @IsUUID()
  technicianId!: string;
}
