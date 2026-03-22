// TRACED:AE-DATASOURCE-CREATE-DTO
import { IsString, MaxLength, IsOptional, IsIn, IsNumber, IsBoolean } from 'class-validator';
import {
  NAME_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  URL_MAX_LENGTH,
  SHORT_STRING_MAX_LENGTH,
  DATA_SOURCE_TYPES,
} from '@analytics-engine/shared';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  @IsIn([...DATA_SOURCE_TYPES])
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(URL_MAX_LENGTH)
  connectionUrl?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
