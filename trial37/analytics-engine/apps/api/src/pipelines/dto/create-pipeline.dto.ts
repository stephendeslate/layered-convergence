import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePipelineDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  schedule?: string;
}
