import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsNumber()
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  workOrderId!: string;
}
