import { IsString, IsNumber, Min, IsUUID } from 'class-validator';

// [TRACED:DM-005] Transaction amount validated as positive decimal
export class CreateTransactionDto {
  @IsUUID()
  sellerId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsString()
  description: string;
}
