import { StripeAccountService } from './stripe-account.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';
export declare class StripeAccountController {
    private readonly stripeAccountService;
    constructor(stripeAccountService: StripeAccountService);
    create(user: any, dto: CreateStripeAccountDto): Promise<{
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
}
