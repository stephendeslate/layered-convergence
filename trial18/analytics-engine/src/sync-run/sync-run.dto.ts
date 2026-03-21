import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSyncRunDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;
}

export class UpdateSyncRunDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  recordsProcessed?: number;

  @IsString()
  @IsOptional()
  errorMessage?: string;
}
