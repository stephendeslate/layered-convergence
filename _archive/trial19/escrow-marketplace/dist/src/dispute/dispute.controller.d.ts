import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
export declare class DisputeController {
    private readonly disputeService;
    constructor(disputeService: DisputeService);
    create(user: any, dto: CreateDisputeDto): Promise<{
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
    resolve(id: string, dto: ResolveDisputeDto): Promise<{
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
