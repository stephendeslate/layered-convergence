import { IsString, IsArray, IsIn, IsOptional } from 'class-validator';
import { TechnicianAvailability } from '@prisma/client';

export class CreateTechnicianDto {
  @IsString()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsIn([
    TechnicianAvailability.AVAILABLE,
    TechnicianAvailability.ON_JOB,
    TechnicianAvailability.OFF_DUTY,
  ])
  availability?: TechnicianAvailability;
}
