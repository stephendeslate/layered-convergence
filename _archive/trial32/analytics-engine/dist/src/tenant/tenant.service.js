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
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const crypto_1 = require("crypto");
let TenantService = class TenantService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const apiKey = `ak_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
        return this.prisma.tenant.create({
            data: {
                ...dto,
                apiKey,
            },
        });
    }
    async findAll() {
        return this.prisma.tenant.findMany();
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async findByApiKey(apiKey) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { apiKey },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.tenant.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.tenant.delete({ where: { id } });
    }
    async regenerateApiKey(id) {
        await this.findOne(id);
        const apiKey = `ak_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
        return this.prisma.tenant.update({
            where: { id },
            data: { apiKey },
        });
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], TenantService);
//# sourceMappingURL=tenant.service.js.map