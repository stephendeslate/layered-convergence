import { IsString, IsOptional, IsInt, Max, MinLength, MaxLength, IsUrl } from 'class-validator';

export class SubmitEvidenceDto {
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @IsOptional()
  @IsInt()
  @Max(10485760, { message: 'File size must be 10MB or less' })
  fileSize?: number;
}
