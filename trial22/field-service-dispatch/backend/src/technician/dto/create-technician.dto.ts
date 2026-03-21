import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  specialties?: string;
}
