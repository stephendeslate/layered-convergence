import { IsString, IsOptional, IsArray, IsEnum, IsEmail } from 'class-validator';
import { TechnicianStatus } from '@prisma/client';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(TechnicianStatus)
  status?: TechnicianStatus;
}
