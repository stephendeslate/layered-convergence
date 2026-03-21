import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { DisputeStatus } from '@prisma/client';
export declare class DisputesController {
    private readonly disputesService;
    constructor(disputesService: DisputesService);
    create(dto: CreateDisputeDto, user: RequestUser): Promise<{
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
    findAll(transactionId?: string, status?: DisputeStatus): Promise<({
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
    findOne(id: string): Promise<{
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
    resolve(id: string, dto: ResolveDisputeDto, user: RequestUser): Promise<{
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
