import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';

export class CreateSyncRunDto {
  @IsUUID()
  dataSourceId!: string;
}

export class UpdateSyncRunDto {
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'running', 'completed', 'failed'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  recordsProcessed?: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
