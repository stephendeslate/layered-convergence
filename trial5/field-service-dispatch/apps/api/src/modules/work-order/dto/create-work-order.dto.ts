import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateWorkOrderDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;
}
