import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateDataSourceConfigDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsBoolean()
  @IsOptional()
  encrypted?: boolean;

  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;
}
