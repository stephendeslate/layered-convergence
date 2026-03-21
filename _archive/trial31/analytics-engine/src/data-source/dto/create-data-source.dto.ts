import { IsString, IsOptional } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
