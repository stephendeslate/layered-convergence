import { IsUUID, IsNumber } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  workOrderId!: string;

  @IsNumber()
  amount!: number;
}
