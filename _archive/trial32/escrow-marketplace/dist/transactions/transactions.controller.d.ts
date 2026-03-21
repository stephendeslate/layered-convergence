import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionTransactionDto } from './dto/transition-transaction.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { TransactionStatus } from '@prisma/client';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(dto: CreateTransactionDto, user: RequestUser): Promise<{
        buyer: {
            email: string;
            name: string;
            id: string;
        };
        provider: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        currency: string;
        description: string | null;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        platformFee: number;
        holdUntil: Date | null;
        stripePaymentIntentId: string | null;
        buyerId: string;
    }>;
    findAll(user: RequestUser, status?: TransactionStatus): Promise<({
        buyer: {
            email: string;
            name: string;
            id: string;
        };
        provider: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        currency: string;
        description: string | null;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        platformFee: number;
        holdUntil: Date | null;
        stripePaymentIntentId: string | null;
        buyerId: string;
    })[]>;
    findOne(id: string, user: RequestUser): Promise<{
        disputes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.DisputeStatus;
            reason: string;
            transactionId: string;
            raisedById: string;
            evidence: string | null;
            resolution: string | null;
            resolvedAt: Date | null;
        }[];
        payouts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: number;
            providerId: string;
            status: import(".prisma/client").$Enums.PayoutStatus;
            transactionId: string;
            stripeTransferId: string | null;
        }[];
        buyer: {
            email: string;
            name: string;
            id: string;
        };
        provider: {
            email: string;
            name: string;
            id: string;
        };
        stateHistory: {
            id: string;
            createdAt: Date;
            reason: string | null;
            fromState: import(".prisma/client").$Enums.TransactionStatus;
            toState: import(".prisma/client").$Enums.TransactionStatus;
            changedBy: string | null;
            transactionId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        currency: string;
        description: string | null;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        platformFee: number;
        holdUntil: Date | null;
        stripePaymentIntentId: string | null;
        buyerId: string;
    }>;
    transition(id: string, dto: TransitionTransactionDto, user: RequestUser): Promise<{
        buyer: {
            email: string;
            name: string;
            id: string;
        };
        provider: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        currency: string;
        description: string | null;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        platformFee: number;
        holdUntil: Date | null;
        stripePaymentIntentId: string | null;
        buyerId: string;
    }>;
    getHistory(id: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        reason: string | null;
        fromState: import(".prisma/client").$Enums.TransactionStatus;
        toState: import(".prisma/client").$Enums.TransactionStatus;
        changedBy: string | null;
        transactionId: string;
    }[]>;
}
