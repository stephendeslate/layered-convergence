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
exports.EmbedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let EmbedService = class EmbedService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createConfig(dto) {
        return this.prisma.embedConfig.create({
            data: dto,
        });
    }
    async getConfig(dashboardId) {
        const config = await this.prisma.embedConfig.findUnique({
            where: { dashboardId },
        });
        if (!config) {
            throw new common_1.NotFoundException('EmbedConfig not found');
        }
        return config;
    }
    async updateConfig(dashboardId, dto) {
        await this.getConfig(dashboardId);
        return this.prisma.embedConfig.update({
            where: { dashboardId },
            data: dto,
        });
    }
    async renderByApiKey(apiKey) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { apiKey },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Invalid API key');
        }
        const dashboards = await this.prisma.dashboard.findMany({
            where: { tenantId: tenant.id, isPublished: true },
            include: {
                widgets: true,
                embedConfig: true,
            },
        });
        return {
            tenant: {
                name: tenant.name,
                primaryColor: tenant.primaryColor,
                fontFamily: tenant.fontFamily,
                logoUrl: tenant.logoUrl,
            },
            dashboards,
        };
    }
};
exports.EmbedService = EmbedService;
exports.EmbedService = EmbedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], EmbedService);
//# sourceMappingURL=embed.service.js.map