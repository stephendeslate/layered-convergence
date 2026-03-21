import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  distance!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stops?: number;

  @IsUUID()
  technicianId!: string;
}
