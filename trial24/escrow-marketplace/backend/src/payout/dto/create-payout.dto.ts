import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  transactionId!: string;
}
