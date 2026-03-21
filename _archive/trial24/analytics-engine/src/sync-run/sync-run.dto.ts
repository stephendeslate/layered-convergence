import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSyncRunDto {
  @IsString()
  dataSourceId!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

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
