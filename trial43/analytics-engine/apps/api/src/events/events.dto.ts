import { IsString, MaxLength, IsOptional, IsObject, IsIn } from 'class-validator';

// TRACED:AE-API-007
export class CreateEventDto {
  @IsString()
  @MaxLength(20)
  @IsIn(['CLICK', 'PAGE_VIEW', 'API_CALL', 'CUSTOM', 'ERROR'])
  type!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsString()
  @MaxLength(255)
  source!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['PENDING', 'PROCESSED', 'FAILED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
