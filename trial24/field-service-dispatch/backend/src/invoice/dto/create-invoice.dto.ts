import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  invoiceNumber!: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  taxAmount!: number;

  @IsNumber()
  totalAmount!: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsUUID()
  workOrderId!: string;

  @IsUUID()
  customerId!: string;
}
