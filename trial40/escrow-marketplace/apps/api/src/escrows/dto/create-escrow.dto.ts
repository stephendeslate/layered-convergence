import { IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class CreateEscrowDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @MaxLength(36)
  transactionId!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
