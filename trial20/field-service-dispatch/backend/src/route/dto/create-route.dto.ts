import { IsString, IsNumber, IsInt, Min } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  technicianId: string;

  @IsString()
  workOrderId: string;

  @IsNumber()
  @Min(0)
  distance: number;

  @IsInt()
  @Min(1)
  estimatedMinutes: number;
}
