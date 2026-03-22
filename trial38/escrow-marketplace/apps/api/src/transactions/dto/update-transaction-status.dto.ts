import { IsEnum, IsString, MaxLength } from 'class-validator';
import { TransactionStatus } from '@escrow-marketplace/shared';

export class UpdateTransactionStatusDto {
  @IsString()
  @IsEnum(TransactionStatus)
  @MaxLength(20)
  status!: TransactionStatus;
}
