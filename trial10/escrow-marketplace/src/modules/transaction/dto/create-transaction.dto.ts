import { IsString, IsInt, IsOptional, Min, IsDateString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  buyerId!: string;

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
