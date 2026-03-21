import { IsString, MinLength } from 'class-validator';

export class UpdateEvidenceDto {
  @IsString()
  @MinLength(1)
  evidence: string;
}
