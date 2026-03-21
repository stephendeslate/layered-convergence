import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsIn(['postgresql', 'api', 'csv', 'webhook'])
  @IsOptional()
  type?: string;
}
