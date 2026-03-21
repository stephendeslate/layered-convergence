import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
