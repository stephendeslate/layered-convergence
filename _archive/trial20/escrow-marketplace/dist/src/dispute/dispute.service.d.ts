import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { DisputeResolution } from './dto/resolve-dispute.dto';
export declare class DisputeService {
    private readonly prisma;
    private readonly transactionService;
    constructor(prisma: PrismaService, transactionService: TransactionService);
    create(userId: string, dto: CreateDisputeDto): Promise<{
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
        updatedAt: Date;
        transactionId: string;
        userId: string;
        reason: string;
        resolved: boolean;
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
        updatedAt: Date;
        transactionId: string;
        userId: string;
        reason: string;
        resolved: boolean;
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
        updatedAt: Date;
        transactionId: string;
        userId: string;
        reason: string;
        resolved: boolean;
    }>;
    resolve(id: string, resolution: DisputeResolution): Promise<{
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
        updatedAt: Date;
        transactionId: string;
        userId: string;
        reason: string;
        resolved: boolean;
    }>;
}
