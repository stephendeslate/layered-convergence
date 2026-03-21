import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateInvoiceDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
