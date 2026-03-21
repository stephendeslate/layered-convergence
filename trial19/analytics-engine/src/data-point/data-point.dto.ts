import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @IsString()
  @IsNotEmpty()
  metric!: string;

  @IsNotEmpty()
  value!: string;

  @IsOptional()
  dimensions?: Record<string, unknown>;

  @IsDateString()
  timestamp!: string;
}
