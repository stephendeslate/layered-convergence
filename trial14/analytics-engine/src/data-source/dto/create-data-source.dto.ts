import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['postgresql', 'api', 'csv', 'webhook'])
  type: string;
}
