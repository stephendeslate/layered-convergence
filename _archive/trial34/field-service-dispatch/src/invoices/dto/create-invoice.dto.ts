import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  workOrderId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
