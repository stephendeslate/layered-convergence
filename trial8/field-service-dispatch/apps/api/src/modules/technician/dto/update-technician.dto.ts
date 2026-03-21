import { IsString, IsOptional, IsArray, IsNumber, IsIn } from 'class-validator';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsIn(['available', 'busy', 'offline'])
  status?: string;

  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @IsOptional()
  @IsNumber()
  currentLng?: number;
}
