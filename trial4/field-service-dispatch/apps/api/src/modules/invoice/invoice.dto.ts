import { IsString, IsInt, IsEnum, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  workOrderId: string;

  @IsInt()
  @Min(100)
  amount: number;
}

export enum InvoiceStatusEnum {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatusEnum)
  status: string;
}
