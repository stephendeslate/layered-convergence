import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  workOrderId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount!: number;
}
