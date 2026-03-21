import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateGpsEventDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsUUID()
  technicianId!: string;
}
