import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsObject } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  @IsNotEmpty()
  metric!: string;

  @IsNumber()
  value!: number;

  @IsDateString()
  timestamp!: string;

  @IsObject()
  @IsOptional()
  dimensions?: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;
}
