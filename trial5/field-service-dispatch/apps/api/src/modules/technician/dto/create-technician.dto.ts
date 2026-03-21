import { IsString, IsUUID, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateTechnicianDto {
  @IsUUID()
  companyId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
