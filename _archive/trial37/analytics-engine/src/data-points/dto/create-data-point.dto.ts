import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateDataPointDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @IsDateString()
  timestamp!: string;

  dimensions!: any;

  metrics!: any;
}
