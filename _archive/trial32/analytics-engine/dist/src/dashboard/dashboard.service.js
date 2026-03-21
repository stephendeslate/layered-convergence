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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        return this.prisma.dashboard.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.dashboard.findMany({
            where: { tenantId },
            include: { widgets: true },
        });
    }
    async findOne(tenantId, id) {
        const dashboard = await this.prisma.dashboard.findFirst({
            where: { id, tenantId },
            include: { widgets: true },
        });
        if (!dashboard) {
            throw new common_1.NotFoundException('Dashboard not found');
        }
        return dashboard;
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        return this.prisma.dashboard.update({
            where: { id },
            data: dto,
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.dashboard.delete({ where: { id } });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map