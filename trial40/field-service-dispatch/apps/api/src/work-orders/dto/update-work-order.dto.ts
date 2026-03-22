// TRACED: FD-WO-004 — Update work order DTO
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class UpdateWorkOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  @MaxLength(20)
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
