import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

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

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  title?: string;

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
  notes?: string;
}

export class TransitionWorkOrderDto {
  @IsIn(['unassigned', 'assigned', 'en_route', 'on_site', 'in_progress', 'completed', 'invoiced', 'paid'])
  toStatus!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AssignWorkOrderDto {
  @IsString()
  technicianId!: string;
}
