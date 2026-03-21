import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  workOrderId: string;

  @IsInt()
  @Min(100)
  amount: number;
}

export class InvoiceQueryDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;
}
