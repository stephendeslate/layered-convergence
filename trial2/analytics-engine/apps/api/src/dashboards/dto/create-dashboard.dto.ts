import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
