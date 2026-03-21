import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { DataSourceType } from '@prisma/client';

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DataSourceType)
  type: DataSourceType;
}
