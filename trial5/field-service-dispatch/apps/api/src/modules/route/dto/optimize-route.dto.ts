import { IsUUID, IsDateString } from 'class-validator';

export class OptimizeRouteDto {
  @IsUUID()
  technicianId: string;

  @IsDateString()
  date: string;
}
