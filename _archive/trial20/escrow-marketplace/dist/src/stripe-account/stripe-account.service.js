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
exports.StripeAccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StripeAccountService = class StripeAccountService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.stripeConnectedAccount.create({
            data: {
                userId,
                stripeAccountId: dto.stripeAccountId,
            },
            include: { user: true },
        });
    }
    async findByUser(userId) {
        const account = await this.prisma.stripeConnectedAccount.findUnique({
            where: { userId },
            include: { user: true },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Stripe account for user ${userId} not found`);
        }
        return account;
    }
    async completeOnboarding(userId) {
        return this.prisma.stripeConnectedAccount.update({
            where: { userId },
            data: { onboardingComplete: true },
            include: { user: true },
        });
    }
    async findAll() {
        return this.prisma.stripeConnectedAccount.findMany({
            include: { user: true },
        });
    }
};
exports.StripeAccountService = StripeAccountService;
exports.StripeAccountService = StripeAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StripeAccountService);
//# sourceMappingURL=stripe-account.service.js.map