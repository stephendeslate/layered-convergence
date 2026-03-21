import { IsString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];
}
