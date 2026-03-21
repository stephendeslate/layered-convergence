import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DataSourceConfigDto } from './create-data-source.dto';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DataSourceConfigDto)
  config?: DataSourceConfigDto;
}
