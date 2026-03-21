import { IsString, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  sellerId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsString()
  description: string;
}
