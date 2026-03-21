import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateGpsEventDto {
  @IsString()
  @IsNotEmpty()
  technicianId!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @IsNumber()
  @IsOptional()
  heading?: number;

  @IsNumber()
  @IsOptional()
  speed?: number;
}
