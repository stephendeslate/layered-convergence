import { IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateGpsEventDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsDateString()
  timestamp!: Date;

  @IsUUID()
  technicianId!: string;
}
