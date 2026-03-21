import { IsString, IsInt, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  providerId!: string;

  @IsInt()
  @Min(100) // minimum $1.00
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  platformFeePercent?: number;

  @IsOptional()
  @IsDateString()
  holdUntil?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
