import { IsString, IsDateString, IsNumber, IsUUID } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  name!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  estimatedDistance!: number;

  @IsUUID()
  technicianId!: string;
}
