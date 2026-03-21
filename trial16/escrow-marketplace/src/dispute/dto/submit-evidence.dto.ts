import { IsString } from 'class-validator';

export class SubmitEvidenceDto {
  @IsString()
  evidence: string;
}
