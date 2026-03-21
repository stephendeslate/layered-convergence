import { PrismaService } from '../prisma/prisma.service';
export declare class WebhookService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    process(data: {
        idempotencyKey: string;
        event: string;
        payload: any;
    }): Promise<{
        id: string;
        idempotencyKey: string;
        event: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        idempotencyKey: string;
        event: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date;
    }[]>;
    findByKey(idempotencyKey: string): Promise<{
        id: string;
        idempotencyKey: string;
        event: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date;
    } | null>;
}
