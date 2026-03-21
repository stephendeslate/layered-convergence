import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;
}
