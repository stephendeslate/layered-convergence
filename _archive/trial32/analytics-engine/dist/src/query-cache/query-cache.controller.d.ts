import { QueryCacheService } from './query-cache.service.js';
export declare class QueryCacheController {
    private readonly queryCacheService;
    constructor(queryCacheService: QueryCacheService);
    get(queryHash: string): Promise<import("@prisma/client/runtime/client").JsonValue>;
    set(body: {
        query: Record<string, any>;
        result: Record<string, any>;
        ttlSeconds?: number;
    }): Promise<{
        id: string;
        queryHash: string;
        result: import("@prisma/client/runtime/client").JsonValue;
        expiresAt: Date;
    }>;
    invalidate(queryHash: string): Promise<void>;
    invalidateAll(): Promise<void>;
}
