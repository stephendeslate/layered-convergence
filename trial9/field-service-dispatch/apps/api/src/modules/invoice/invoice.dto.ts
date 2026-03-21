import { IsString, IsInt, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  workOrderId!: string;

  @IsInt()
  @Min(100)
  amount!: number;
}
