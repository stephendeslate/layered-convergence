import { IsIn } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

// [TRACED:AC-003] Transaction status update DTO with allowed transitions
export class UpdateTransactionStatusDto {
  @IsIn([
    TransactionStatus.FUNDED,
    TransactionStatus.SHIPPED,
    TransactionStatus.DELIVERED,
    TransactionStatus.COMPLETED,
    TransactionStatus.DISPUTE,
    TransactionStatus.REFUNDED,
  ])
  status!: TransactionStatus;
}
