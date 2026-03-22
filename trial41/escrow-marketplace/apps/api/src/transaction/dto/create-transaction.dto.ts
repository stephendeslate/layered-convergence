import { IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsString()
  @MaxLength(36)
  sellerId: string;

  @IsString()
  @MaxLength(36)
  listingId: string;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
