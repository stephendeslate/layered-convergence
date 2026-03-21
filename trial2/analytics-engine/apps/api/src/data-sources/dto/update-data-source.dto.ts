import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}
