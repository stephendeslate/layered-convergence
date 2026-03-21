import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsNumber()
  @IsOptional()
  currentLat?: number;

  @IsNumber()
  @IsOptional()
  currentLng?: number;
}
