import { IsString, IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';

export class CreateWorkOrderDto {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
