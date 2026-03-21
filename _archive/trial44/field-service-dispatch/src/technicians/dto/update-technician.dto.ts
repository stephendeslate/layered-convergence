import { IsString, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';

enum TechnicianStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFF_DUTY = 'OFF_DUTY',
}

export class UpdateTechnicianDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsEnum(TechnicianStatus)
  @IsOptional()
  status?: TechnicianStatus;

  @IsNumber()
  @IsOptional()
  currentLat?: number;

  @IsNumber()
  @IsOptional()
  currentLng?: number;
}
