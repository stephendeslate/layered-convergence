import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: Date;

  @IsUUID()
  customerId!: string;

  @IsUUID()
  @IsOptional()
  technicianId?: string;
}
