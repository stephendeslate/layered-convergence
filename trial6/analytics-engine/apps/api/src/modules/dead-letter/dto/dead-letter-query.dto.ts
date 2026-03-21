import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class DeadLetterQueryDto {
  @IsString()
  @IsOptional()
  dataSourceId?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
