import { IsUUID, IsInt, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  transactionId: string;

  @IsInt()
  @Min(1)
  amount: number;
}
