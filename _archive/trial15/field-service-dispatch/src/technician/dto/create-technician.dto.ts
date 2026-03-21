import { IsString, IsEmail, IsArray, IsOptional } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @IsOptional()
  @IsString()
  phone?: string;
}
