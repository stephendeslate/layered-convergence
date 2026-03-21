import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

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
