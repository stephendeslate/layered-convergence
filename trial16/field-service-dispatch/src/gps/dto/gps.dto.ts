import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateGpsEventDto {
  @IsString()
  @IsNotEmpty()
  technicianId!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;
}
