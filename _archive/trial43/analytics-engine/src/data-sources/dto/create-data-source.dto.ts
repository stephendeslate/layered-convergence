import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;
}
