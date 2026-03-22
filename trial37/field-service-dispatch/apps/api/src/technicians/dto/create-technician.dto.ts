// TRACED: FD-TECH-004 — Create technician DTO with @MaxLength on all strings
import { IsString, MaxLength } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(20)
  latitude: string;

  @IsString()
  @MaxLength(20)
  longitude: string;
}
