import { IsString, MaxLength, IsNumber, IsArray, IsEmail } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsArray()
  @IsString({ each: true })
  specialties!: string[];

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;
}
