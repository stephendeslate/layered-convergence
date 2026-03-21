import { IsString, IsOptional, IsDateString, IsNumberString } from 'class-validator';

export class CreateDataPointDto {
  @IsNumberString()
  value!: string;

  @IsString()
  label!: string;

  @IsString()
  dataSourceId!: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
