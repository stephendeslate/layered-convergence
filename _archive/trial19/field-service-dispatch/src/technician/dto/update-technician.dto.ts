import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  phone?: string;
}
