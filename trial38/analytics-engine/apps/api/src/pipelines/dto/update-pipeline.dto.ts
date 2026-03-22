import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdatePipelineDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  schedule?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;
}
