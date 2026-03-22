import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdatePipelineDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  @IsIn(['IDLE', 'RUNNING', 'COMPLETED', 'FAILED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  schedule?: string;
}
