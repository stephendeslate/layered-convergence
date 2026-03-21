import { PrismaService } from '../prisma/prisma.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';
export declare class StripeAccountService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateStripeAccountDto): Promise<{
        user: {
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
        userId: string;
        stripeAccountId: string;
        onboardingComplete: boolean;
    }>;
    findByUser(userId: string): Promise<{
        user: {
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
        userId: string;
        stripeAccountId: string;
        onboardingComplete: boolean;
    }>;
    completeOnboarding(userId: string): Promise<{
        user: {
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
        userId: string;
        stripeAccountId: string;
        onboardingComplete: boolean;
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
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        stripeAccountId: string;
        onboardingComplete: boolean;
    })[]>;
}
