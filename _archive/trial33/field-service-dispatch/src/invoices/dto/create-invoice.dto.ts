import { IsUUID, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @IsUUID()
  workOrderId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;
}
