import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(['AVAILABLE', 'BUSY', 'OFFLINE'])
  status?: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}
