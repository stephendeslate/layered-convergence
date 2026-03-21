import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  distance!: number;

  @IsUUID()
  technicianId!: string;
}
