import { IsUUID, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  providerId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  holdUntil?: string;
}
