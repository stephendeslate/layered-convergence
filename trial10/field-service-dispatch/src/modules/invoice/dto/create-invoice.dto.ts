import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  workOrderId!: string;

  @IsInt()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
