import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'amount must be a valid decimal with up to 2 decimal places' })
  amount!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'tax must be a valid decimal with up to 2 decimal places' })
  tax!: string;

  @IsUUID()
  workOrderId!: string;
}
