import { IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateEscrowDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance: number;

  @IsString()
  @MaxLength(36)
  transactionId: string;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
