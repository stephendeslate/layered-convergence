import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateSyncRunDto {
  @IsString()
  dataSourceId!: string;
}

export class UpdateSyncRunDto {
  @IsOptional()
  @IsIn(['running', 'completed', 'failed'])
  status?: string;

  @IsOptional()
  @IsString()
  errorLog?: string;
}
