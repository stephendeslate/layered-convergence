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
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  holdUntil?: string;
}

export class TransactionActionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
