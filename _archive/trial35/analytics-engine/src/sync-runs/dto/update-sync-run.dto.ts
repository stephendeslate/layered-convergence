import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSyncRunDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  rowsIngested?: number;

  @IsOptional()
  @IsString()
  errorLog?: string;
}
