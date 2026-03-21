import { IsString, MinLength } from 'class-validator';

export class SubmitEvidenceDto {
  @IsString()
  @MinLength(1)
  evidence!: string;
}
