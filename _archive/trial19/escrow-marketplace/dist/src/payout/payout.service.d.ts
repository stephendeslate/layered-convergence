import { PrismaService } from '../prisma/prisma.service';
export declare class PayoutService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        transactionId: string;
        userId: string;
        amount: number;
    }): Promise<{
        user: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            buyerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        userId: string;
    }>;
    findAll(): Promise<({
        user: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            buyerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        userId: string;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            buyerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        userId: string;
    }>;
    findByUser(userId: string): Promise<({
        user: {
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            buyerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        userId: string;
    })[]>;
}
