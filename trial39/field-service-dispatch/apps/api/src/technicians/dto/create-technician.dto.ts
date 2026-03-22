// TRACED: FD-TECH-001 — Create technician DTO with GPS validation
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialty?: string;

  @IsString()
  @MaxLength(20)
  latitude!: string;

  @IsString()
  @MaxLength(20)
  longitude!: string;
}
