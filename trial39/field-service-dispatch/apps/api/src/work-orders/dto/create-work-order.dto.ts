// TRACED: FD-WO-001 — Create work order DTO with GPS and validation
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  latitude?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  longitude?: string;
}
