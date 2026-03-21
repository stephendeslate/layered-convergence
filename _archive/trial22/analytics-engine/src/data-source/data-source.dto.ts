import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  name!: string;

  @IsString()
  @IsIn(['api', 'postgresql', 'csv', 'webhook'])
  type!: string;
}

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['api', 'postgresql', 'csv', 'webhook'])
  type?: string;
}
