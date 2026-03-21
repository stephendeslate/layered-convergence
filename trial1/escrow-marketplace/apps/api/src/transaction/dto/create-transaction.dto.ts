import { IsString, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  providerId: string;

  @IsInt()
  @Min(500, { message: 'Minimum amount is $5.00 (500 cents)' })
  @Max(1000000, { message: 'Maximum amount is $10,000.00 (1000000 cents)' })
  amount: number;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string;
}
