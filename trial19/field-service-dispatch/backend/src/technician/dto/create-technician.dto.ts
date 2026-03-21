import { IsArray, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TechnicianAvailability } from '@prisma/client';

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
  skills!: string[];

  @IsIn([TechnicianAvailability.AVAILABLE, TechnicianAvailability.ON_JOB, TechnicianAvailability.OFF_DUTY])
  @IsOptional()
  availability?: TechnicianAvailability;
}
