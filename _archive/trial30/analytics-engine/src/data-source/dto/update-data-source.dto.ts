import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['active', 'paused', 'archived'])
  status?: string;
}
