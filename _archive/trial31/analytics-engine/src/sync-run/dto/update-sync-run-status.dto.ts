import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateSyncRunStatusDto {
  @IsString()
  status!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  rowsIngested?: number;

  @IsOptional()
  @IsString()
  errorLog?: string;
}
