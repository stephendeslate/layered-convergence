import { IsString, IsOptional, IsIn, IsDateString, MinLength } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsString()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class TransitionWorkOrderDto {
  @IsString()
  @IsIn(['unassigned', 'assigned', 'en_route', 'on_site', 'in_progress', 'completed', 'invoiced', 'paid'])
  status!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
