"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryCacheService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const crypto_1 = require("crypto");
let QueryCacheService = class QueryCacheService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateHash(query) {
        return (0, crypto_1.createHash)('sha256')
            .update(JSON.stringify(query))
            .digest('hex');
    }
    async get(queryHash) {
        const cached = await this.prisma.queryCache.findFirst({
            where: { queryHash },
        });
        if (!cached) {
            return null;
        }
        if (new Date() > cached.expiresAt) {
            await this.prisma.queryCache.delete({ where: { id: cached.id } });
            return null;
        }
        return cached.result;
    }
    async set(queryHash, result, ttlSeconds = 300) {
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        const existing = await this.prisma.queryCache.findFirst({
            where: { queryHash },
        });
        if (existing) {
            return this.prisma.queryCache.update({
                where: { id: existing.id },
                data: { result, expiresAt },
            });
        }
        return this.prisma.queryCache.create({
            data: { queryHash, result, expiresAt },
        });
    }
    async invalidate(queryHash) {
        const existing = await this.prisma.queryCache.findFirst({
            where: { queryHash },
        });
        if (existing) {
            await this.prisma.queryCache.delete({ where: { id: existing.id } });
        }
    }
    async invalidateAll() {
        await this.prisma.queryCache.deleteMany();
    }
};
exports.QueryCacheService = QueryCacheService;
exports.QueryCacheService = QueryCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], QueryCacheService);
//# sourceMappingURL=query-cache.service.js.map