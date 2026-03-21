import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  amount!: string;

  @IsString()
  @IsNotEmpty()
  tax!: string;

  @IsString()
  @IsNotEmpty()
  total!: string;

  @IsUUID()
  workOrderId!: string;
}
