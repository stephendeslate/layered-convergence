import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  workOrderId!: string;

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
