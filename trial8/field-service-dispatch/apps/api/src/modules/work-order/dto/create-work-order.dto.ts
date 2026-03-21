import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  customerId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  technicianId?: string;
}
