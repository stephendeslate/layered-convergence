import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class OptimizeRouteDto {
  @IsString()
  @IsNotEmpty()
  technicianId: string;

  @IsDateString()
  date: string;
}
