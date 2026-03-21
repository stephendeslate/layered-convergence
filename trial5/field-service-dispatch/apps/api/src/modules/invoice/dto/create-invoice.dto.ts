import { IsUUID, IsInt, Min, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  workOrderId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
