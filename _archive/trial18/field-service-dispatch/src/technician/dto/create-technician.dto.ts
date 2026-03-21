import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateTechnicianDto {
  @IsUUID()
  companyId!: string;

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
