import { IsString, IsOptional, IsUUID, IsArray, IsNumber } from 'class-validator';

export class CreateTechnicianDto {
  @IsUUID()
  companyId!: string;

  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @IsOptional()
  @IsNumber()
  currentLng?: number;
}
