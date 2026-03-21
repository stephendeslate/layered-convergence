import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsArray()
  @IsString({ each: true })
  specialties!: string[];
}
