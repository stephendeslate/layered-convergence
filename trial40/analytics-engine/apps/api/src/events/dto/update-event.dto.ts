import { IsString, MaxLength, IsIn, IsOptional } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(36)
  @IsIn(['PAGE_VIEW', 'CLICK', 'CONVERSION', 'CUSTOM'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  payload?: Record<string, unknown>;
}
