import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateTechnicianDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
