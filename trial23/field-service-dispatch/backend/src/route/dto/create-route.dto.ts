import { IsString, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  name!: string;

  @IsDateString()
  date!: Date;

  @IsNumber()
  estimatedDistance!: number;

  @IsUUID()
  technicianId!: string;
}
