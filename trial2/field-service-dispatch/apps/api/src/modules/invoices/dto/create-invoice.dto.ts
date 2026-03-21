import { IsUUID, IsString, IsNumber, IsOptional, IsArray, IsDateString, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  workOrderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  lineItems?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
