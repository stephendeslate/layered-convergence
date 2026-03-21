import { IsString, IsOptional, IsUUID, IsInt, Min, Max, IsDateString } from 'class-validator';

export class UpdateWorkOrderDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  technicianId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
