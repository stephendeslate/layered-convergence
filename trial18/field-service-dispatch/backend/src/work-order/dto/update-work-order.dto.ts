import { IsInt, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

export class UpdateWorkOrderDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  @IsUUID()
  @IsOptional()
  technicianId?: string;
}
