import { IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsIn([
    InvoiceStatus.DRAFT,
    InvoiceStatus.SENT,
    InvoiceStatus.PAID,
    InvoiceStatus.OVERDUE,
  ])
  status?: InvoiceStatus;
}
