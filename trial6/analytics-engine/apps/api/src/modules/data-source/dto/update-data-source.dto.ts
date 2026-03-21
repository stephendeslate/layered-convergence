import { IsString, IsOptional } from 'class-validator';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  name?: string;
}
