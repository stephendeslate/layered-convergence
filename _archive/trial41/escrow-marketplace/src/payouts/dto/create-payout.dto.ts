import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsUUID()
  transactionId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
