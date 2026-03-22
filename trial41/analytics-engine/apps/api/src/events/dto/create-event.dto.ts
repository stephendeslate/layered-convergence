// TRACED:AE-EVENT-CREATE-DTO
import { IsString, MaxLength, IsOptional, IsIn, IsNumber } from 'class-validator';
import {
  NAME_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  UUID_MAX_LENGTH,
  SHORT_STRING_MAX_LENGTH,
  EVENT_STATUSES,
} from '@analytics-engine/shared';

export class CreateEventDto {
  @IsString()
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  @IsIn([...EVENT_STATUSES])
  status?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(UUID_MAX_LENGTH)
  dataSourceId?: string;
}
