import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateWorkOrderDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
