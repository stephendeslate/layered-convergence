import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
