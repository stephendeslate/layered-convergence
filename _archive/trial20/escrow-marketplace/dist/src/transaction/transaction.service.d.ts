import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus } from './dto/transition-transaction.dto';
export declare class TransactionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(buyerId: string, dto: CreateTransactionDto): Promise<{
        buyer: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        provider: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        buyerId: string;
    }>;
    findAll(): Promise<({
        buyer: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        provider: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        stateHistory: {
            id: string;
            transactionId: string;
            fromStatus: import(".prisma/client").$Enums.TransactionStatus;
            toStatus: import(".prisma/client").$Enums.TransactionStatus;
            changedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        buyerId: string;
    })[]>;
    findOne(id: string): Promise<{
        buyer: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        provider: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        stateHistory: {
            id: string;
            transactionId: string;
            fromStatus: import(".prisma/client").$Enums.TransactionStatus;
            toStatus: import(".prisma/client").$Enums.TransactionStatus;
            changedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        buyerId: string;
    }>;
    findByUser(userId: string): Promise<({
        buyer: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        provider: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        stateHistory: {
            id: string;
            transactionId: string;
            fromStatus: import(".prisma/client").$Enums.TransactionStatus;
            toStatus: import(".prisma/client").$Enums.TransactionStatus;
            changedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        buyerId: string;
    })[]>;
    transition(id: string, newStatus: TransactionStatus): Promise<{
        buyer: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        provider: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        stateHistory: {
            id: string;
            transactionId: string;
            fromStatus: import(".prisma/client").$Enums.TransactionStatus;
            toStatus: import(".prisma/client").$Enums.TransactionStatus;
            changedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        buyerId: string;
    }>;
    getValidTransitions(): Record<string, string[]>;
}
