// TRACED:AE-API-07 — CreatePipelineDto with @IsString, @MaxLength, UUID @MaxLength(36)

import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreatePipelineDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  schedule?: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
