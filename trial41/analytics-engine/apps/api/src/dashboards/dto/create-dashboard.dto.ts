// TRACED:AE-DASHBOARD-CREATE-DTO
import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from '@analytics-engine/shared';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
