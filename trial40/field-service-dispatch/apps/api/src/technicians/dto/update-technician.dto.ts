// TRACED: FD-TECH-004 — Update technician DTO
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class UpdateTechnicianDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialty?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['AVAILABLE', 'BUSY', 'OFF_DUTY', 'INACTIVE'])
  @MaxLength(20)
  status?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  latitude?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  longitude?: string;
}
