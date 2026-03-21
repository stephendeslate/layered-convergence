import { IsIn } from 'class-validator';

export class TransitionInvoiceDto {
  @IsIn(['DRAFT', 'SENT', 'PAID', 'VOID'])
  status!: 'DRAFT' | 'SENT' | 'PAID' | 'VOID';
}
