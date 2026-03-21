import { IsString, IsOptional, IsEmail, IsUUID } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;
}
