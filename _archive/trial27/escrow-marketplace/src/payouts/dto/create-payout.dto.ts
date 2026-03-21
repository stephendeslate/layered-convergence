import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsUUID()
  @IsNotEmpty()
  transactionId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsOptional()
  stripeTransferId?: string;
}
