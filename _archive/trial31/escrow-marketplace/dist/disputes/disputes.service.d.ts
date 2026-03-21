import { PrismaService } from '../prisma/prisma.service';
import { TransactionStateMachine } from '../transactions/transaction-state-machine';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputeStatus } from '@prisma/client';
export declare class DisputesService {
    private readonly prisma;
    private readonly stateMachine;
    constructor(prisma: PrismaService, stateMachine: TransactionStateMachine);
    create(dto: CreateDisputeDto, userId: string): Promise<{
        transaction: {
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
        };
        raisedBy: {
            email: string;
            name: string;
            id: string;
        };
    } & {
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
    }>;
    findAll(filters?: {
        transactionId?: string;
        status?: DisputeStatus;
    }): Promise<({
        transaction: {
            id: string;
            amount: number;
            status: import(".prisma/client").$Enums.TransactionStatus;
        };
        raisedBy: {
            email: string;
            name: string;
            id: string;
        };
    } & {
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
    })[]>;
    findById(id: string): Promise<{
        transaction: {
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
        };
        raisedBy: {
            email: string;
            name: string;
            id: string;
        };
    } & {
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
    }>;
    resolve(id: string, dto: ResolveDisputeDto, adminId: string): Promise<{
        transaction: {
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
        };
    } & {
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
    }>;
}
