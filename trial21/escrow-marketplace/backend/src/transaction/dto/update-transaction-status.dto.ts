import { IsIn } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateTransactionStatusDto {
  @IsIn([
    TransactionStatus.FUNDED,
    TransactionStatus.SHIPPED,
    TransactionStatus.DELIVERED,
    TransactionStatus.RELEASED,
    TransactionStatus.DISPUTED,
  ])
  status: TransactionStatus;
}
