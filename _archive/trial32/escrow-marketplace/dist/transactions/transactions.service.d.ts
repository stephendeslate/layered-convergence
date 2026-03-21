import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStateMachine } from './transaction-state-machine';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionTransactionDto } from './dto/transition-transaction.dto';
import { TransactionStatus } from '@prisma/client';
export declare class TransactionsService {
    private readonly prisma;
    private readonly stateMachine;
    private readonly escrowQueue;
    constructor(prisma: PrismaService, stateMachine: TransactionStateMachine, escrowQueue: Queue);
    create(dto: CreateTransactionDto, buyerId: string, tenantId: string): Promise<{
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
    findAll(tenantId: string, filters?: {
        status?: TransactionStatus;
        buyerId?: string;
        providerId?: string;
    }): Promise<({
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
    findById(id: string, tenantId: string): Promise<{
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
    transition(id: string, dto: TransitionTransactionDto, userId: string, tenantId: string): Promise<{
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
    getStateHistory(transactionId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        reason: string | null;
        fromState: import(".prisma/client").$Enums.TransactionStatus;
        toState: import(".prisma/client").$Enums.TransactionStatus;
        changedBy: string | null;
        transactionId: string;
    }[]>;
}
