import { IsString, IsNumber, Min } from 'class-validator';

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
