// TRACED: FD-TECH-004 — Update technician DTO with optional fields
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class UpdateTechnicianDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialty?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['AVAILABLE', 'BUSY', 'OFF_DUTY', 'INACTIVE'])
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
