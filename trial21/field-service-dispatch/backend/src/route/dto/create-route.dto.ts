import { IsString, IsNumber, IsInt, Min } from 'class-validator';

// [TRACED:AC-009] Route creation DTO with validated distance and estimatedMinutes
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
