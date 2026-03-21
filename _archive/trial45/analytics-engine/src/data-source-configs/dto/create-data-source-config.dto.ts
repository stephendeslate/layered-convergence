import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDataSourceConfigDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  connectionConfig!: any;

  fieldMapping!: any;

  @IsOptional()
  transformSteps?: any;

  @IsOptional()
  @IsString()
  syncSchedule?: string;
}
