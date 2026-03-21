import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldMappingDto } from './create-data-source.dto';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  syncSchedule?: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldMappingDto)
  @IsOptional()
  fieldMappings?: FieldMappingDto[];

  @IsArray()
  @IsOptional()
  transforms?: Record<string, unknown>[];
}
