import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  name!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
