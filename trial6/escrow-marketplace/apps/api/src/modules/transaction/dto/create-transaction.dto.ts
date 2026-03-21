import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsInt()
  @Min(100) // Minimum $1.00 in cents
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class ReleaseTransactionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
