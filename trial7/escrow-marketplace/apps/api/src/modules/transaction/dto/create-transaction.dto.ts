import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  providerId!: string;

  @IsInt()
  @Min(100) // minimum 100 cents = $1
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
