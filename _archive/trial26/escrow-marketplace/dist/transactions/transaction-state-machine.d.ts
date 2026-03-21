import { TransactionStatus } from '@prisma/client';
export declare const VALID_TRANSITIONS: Map<TransactionStatus, TransactionStatus[]>;
export declare class TransactionStateMachine {
    validateTransition(from: TransactionStatus, to: TransactionStatus): void;
    canTransition(from: TransactionStatus, to: TransactionStatus): boolean;
    getValidTransitions(from: TransactionStatus): TransactionStatus[];
}
