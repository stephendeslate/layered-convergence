import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @IsString()
  @IsNotEmpty()
  metric!: string;

  @IsNumber()
  value!: number;

  @IsObject()
  @IsOptional()
  dimensions?: Record<string, unknown>;

  @IsDateString()
  timestamp!: string;
}
