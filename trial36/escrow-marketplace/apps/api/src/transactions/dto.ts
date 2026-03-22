import { IsEnum, IsUUID } from 'class-validator';
import { TransactionStatus } from '@escrow-marketplace/shared';

export class CreateTransactionDto {
  @IsUUID()
  listingId!: string;
}

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  status!: TransactionStatus;
}
