import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  workOrderId!: string;

  @IsNumber()
  amount!: number;
}
