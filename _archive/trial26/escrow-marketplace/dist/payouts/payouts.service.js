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
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PayoutsService = class PayoutsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, providerId) {
        return this.prisma.payout.create({
            data: {
                transactionId: dto.transactionId,
                providerId,
                amount: dto.amount,
                stripeTransferId: dto.stripeTransferId,
                status: client_1.PayoutStatus.PENDING,
            },
            include: {
                transaction: { select: { id: true, amount: true, status: true } },
                provider: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async findAll(providerId) {
        return this.prisma.payout.findMany({
            where: providerId ? { providerId } : {},
            include: {
                transaction: { select: { id: true, amount: true, status: true } },
                provider: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        const payout = await this.prisma.payout.findUnique({
            where: { id },
            include: {
                transaction: true,
                provider: { select: { id: true, name: true, email: true } },
            },
        });
        if (!payout) {
            throw new common_1.NotFoundException('Payout not found');
        }
        return payout;
    }
    async updateStatus(id, status) {
        await this.findById(id);
        return this.prisma.payout.update({
            where: { id },
            data: { status },
        });
    }
    async getProviderPayoutSummary(providerId) {
        const payouts = await this.prisma.payout.findMany({
            where: { providerId },
        });
        const totalPaid = payouts
            .filter((p) => p.status === client_1.PayoutStatus.COMPLETED)
            .reduce((sum, p) => sum + p.amount, 0);
        const totalPending = payouts
            .filter((p) => p.status === client_1.PayoutStatus.PENDING || p.status === client_1.PayoutStatus.PROCESSING)
            .reduce((sum, p) => sum + p.amount, 0);
        return {
            totalPaid,
            totalPending,
            count: payouts.length,
        };
    }
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map