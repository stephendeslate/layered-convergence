import { IsUUID, IsDateString, IsArray, ArrayMinSize, IsOptional, IsInt, Min } from 'class-validator';

export class CreateRouteDto {
  @IsUUID()
  technicianId: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  workOrderIds: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDistance?: number;
}
