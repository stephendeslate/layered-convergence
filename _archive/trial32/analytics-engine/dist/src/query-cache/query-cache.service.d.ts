import { PrismaService } from '../prisma/prisma.service.js';
export declare class QueryCacheService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateHash(query: Record<string, any>): string;
    get(queryHash: string): Promise<import("@prisma/client/runtime/client").JsonValue>;
    set(queryHash: string, result: Record<string, any>, ttlSeconds?: number): Promise<{
        id: string;
        queryHash: string;
        result: import("@prisma/client/runtime/client").JsonValue;
        expiresAt: Date;
    }>;
    invalidate(queryHash: string): Promise<void>;
    invalidateAll(): Promise<void>;
}
