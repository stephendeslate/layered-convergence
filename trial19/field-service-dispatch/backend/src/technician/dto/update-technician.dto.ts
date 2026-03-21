import { IsArray, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TechnicianAvailability } from '@prisma/client';

export class UpdateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsIn([TechnicianAvailability.AVAILABLE, TechnicianAvailability.ON_JOB, TechnicianAvailability.OFF_DUTY])
  @IsOptional()
  availability?: TechnicianAvailability;
}
