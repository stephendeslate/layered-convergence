import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SubmitEvidenceDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;

  @IsString()
  @IsOptional()
  evidenceType?: string;
}
