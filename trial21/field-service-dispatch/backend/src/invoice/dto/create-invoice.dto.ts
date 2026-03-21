import { IsString, IsNumber, Min } from 'class-validator';

// [TRACED:AC-011] Invoice creation DTO with Decimal-compatible amount and tax
export class CreateInvoiceDto {
  @IsString()
  workOrderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  tax: number;
}
