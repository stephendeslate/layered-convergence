import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

// [TRACED:AC-007] CreateWorkOrderDto with priority range validation 1-5
export class CreateWorkOrderDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsString()
  scheduledAt?: string;
}
