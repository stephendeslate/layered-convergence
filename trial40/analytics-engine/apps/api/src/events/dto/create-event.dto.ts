import { IsString, MaxLength, IsIn, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(36)
  @IsIn(['PAGE_VIEW', 'CLICK', 'CONVERSION', 'CUSTOM'])
  type: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  payload?: Record<string, unknown>;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
