import { IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitEvidenceDto {
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  evidence!: string;
}
