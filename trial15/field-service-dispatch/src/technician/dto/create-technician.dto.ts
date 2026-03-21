import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @IsString()
  @IsOptional()
  availability?: string;
}
