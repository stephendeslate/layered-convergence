import { IsString, IsIn } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  name!: string;

  @IsIn(['postgresql', 'api', 'csv', 'webhook'])
  type!: string;
}
