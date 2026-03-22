// TRACED: FD-TECH-005 — Update technician DTO with @MaxLength on all strings
import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateTechnicianDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
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
