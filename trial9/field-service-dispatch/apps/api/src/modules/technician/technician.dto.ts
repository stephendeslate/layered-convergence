import { IsString, IsOptional, IsEmail, IsArray, IsNumber, IsIn } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];
}

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
  skills?: string[];

  @IsOptional()
  @IsIn(['available', 'busy', 'offline'])
  status?: string;
}

export class UpdateLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}
