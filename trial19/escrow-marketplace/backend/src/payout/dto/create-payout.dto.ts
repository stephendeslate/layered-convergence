import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsUUID()
  transactionId!: string;

  @IsUUID()
  recipientId!: string;
}
