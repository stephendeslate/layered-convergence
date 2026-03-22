// TRACED: FD-SA-002 — Update service area DTO
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateServiceAreaDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;
}
