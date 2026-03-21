import { TransactionStatus } from '@prisma/client';
export declare class TransitionTransactionDto {
    status: TransactionStatus;
    reason?: string;
}
