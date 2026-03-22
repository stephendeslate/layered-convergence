// TRACED: FD-WO-005 — Update work order DTO with @MaxLength on all strings
import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateWorkOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
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
