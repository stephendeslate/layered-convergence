"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QueryCacheService", {
    enumerable: true,
    get: function() {
        return QueryCacheService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
const _crypto = require("crypto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let QueryCacheService = class QueryCacheService {
    async get(query) {
        const queryHash = this.hashQuery(query);
        const cached = await this.prisma.queryCache.findUnique({
            where: {
                queryHash
            }
        });
        if (!cached) return null;
        if (new Date() > cached.expiresAt) {
            await this.prisma.queryCache.delete({
                where: {
                    queryHash
                }
            });
            return null;
        }
        return cached.result;
    }
    async set(query, result, ttlSeconds = 300) {
        const queryHash = this.hashQuery(query);
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        return this.prisma.queryCache.upsert({
            where: {
                queryHash
            },
            update: {
                result,
                expiresAt
            },
            create: {
                queryHash,
                result,
                expiresAt
            }
        });
    }
    async invalidate(query) {
        const queryHash = this.hashQuery(query);
        try {
            await this.prisma.queryCache.delete({
                where: {
                    queryHash
                }
            });
        } catch  {
        // ignore if not found
        }
    }
    async clearExpired() {
        await this.prisma.queryCache.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });
    }
    hashQuery(query) {
        return (0, _crypto.createHash)('sha256').update(query).digest('hex');
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
QueryCacheService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], QueryCacheService);

//# sourceMappingURL=query-cache.service.js.map