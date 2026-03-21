export declare enum TransactionStatus {
    PENDING = "PENDING",
    FUNDED = "FUNDED",
    DELIVERED = "DELIVERED",
    RELEASED = "RELEASED",
    DISPUTED = "DISPUTED",
    REFUNDED = "REFUNDED",
    EXPIRED = "EXPIRED"
}
export declare class TransitionTransactionDto {
    status: TransactionStatus;
}
