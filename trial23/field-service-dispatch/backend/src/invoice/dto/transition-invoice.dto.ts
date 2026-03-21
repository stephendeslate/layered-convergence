import { IsIn } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class TransitionInvoiceDto {
  @IsIn(['DRAFT', 'SENT', 'PAID', 'VOID'])
  status!: InvoiceStatus;
}
