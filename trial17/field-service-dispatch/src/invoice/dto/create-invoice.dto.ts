import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  workOrderId!: string;

  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  tax?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
