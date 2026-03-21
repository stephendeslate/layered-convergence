import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PayoutStatus } from '@prisma/client';
export declare class PayoutsController {
    private readonly payoutsService;
    constructor(payoutsService: PayoutsService);
    create(dto: CreatePayoutDto, user: RequestUser): Promise<{
        transaction: {
            id: string;
            amount: number;
            status: import(".prisma/client").$Enums.TransactionStatus;
        };
        provider: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        providerId: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        transactionId: string;
        stripeTransferId: string | null;
    }>;
    findAll(user: RequestUser): Promise<({
        transaction: {
            id: string;
            amount: number;
            status: import(".prisma/client").$Enums.TransactionStatus;
        };
        provider: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        providerId: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        transactionId: string;
        stripeTransferId: string | null;
    })[]>;
    getSummary(user: RequestUser): Promise<{
        totalPaid: number;
        totalPending: number;
        count: number;
    }>;
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
        provider: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        providerId: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        transactionId: string;
        stripeTransferId: string | null;
    }>;
    updateStatus(id: string, status: PayoutStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        providerId: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        transactionId: string;
        stripeTransferId: string | null;
    }>;
}
