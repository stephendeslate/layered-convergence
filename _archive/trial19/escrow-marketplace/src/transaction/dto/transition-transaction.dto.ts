import { IsEnum } from 'class-validator';

export enum TransactionStatus {
  PENDING = 'PENDING',
  FUNDED = 'FUNDED',
  DELIVERED = 'DELIVERED',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
}

export class TransitionTransactionDto {
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}
