import { IsIn } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateStatusDto {
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
