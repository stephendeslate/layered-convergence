import { IsString, IsIn, IsOptional, IsInt } from 'class-validator';

export class UpdateSyncRunStatusDto {
  @IsIn(['pending', 'running', 'completed', 'failed'])
  status!: string;

  @IsOptional()
  @IsInt()
  rowsIngested?: number;

  @IsOptional()
  @IsString()
  errorLog?: string;
}
