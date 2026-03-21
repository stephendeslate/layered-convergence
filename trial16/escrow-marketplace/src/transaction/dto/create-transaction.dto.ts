import { IsString, IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsUUID()
  sellerId: string;
}
