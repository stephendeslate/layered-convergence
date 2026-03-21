import { IsString, IsInt, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsString()
  transactionId!: string;

  @IsInt()
  @Min(1)
  amount!: number;
}
