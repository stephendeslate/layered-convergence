import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDataSourceConfigDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsBoolean()
  @IsOptional()
  encrypted?: boolean;
}
