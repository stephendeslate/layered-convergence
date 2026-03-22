// TRACED: FD-SA-001 — Create service area DTO with validation
import { IsString, MaxLength } from 'class-validator';

export class CreateServiceAreaDto {
  @IsString()
  @MaxLength(200)
  name!: string;
}
