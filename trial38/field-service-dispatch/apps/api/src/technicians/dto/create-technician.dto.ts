// TRACED: FD-TECH-004 — Create technician DTO with @MaxLength on all strings
import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  specialty?: string;

  @IsString()
  @MaxLength(20)
  latitude: string;

  @IsString()
  @MaxLength(20)
  longitude: string;
}
