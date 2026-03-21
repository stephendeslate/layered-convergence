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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const transaction_state_machine_1 = require("./transaction-state-machine");
const client_1 = require("@prisma/client");
let TransactionsService = class TransactionsService {
    prisma;
    stateMachine;
    escrowQueue;
    constructor(prisma, stateMachine, escrowQueue) {
        this.prisma = prisma;
        this.stateMachine = stateMachine;
        this.escrowQueue = escrowQueue;
    }
    async create(dto, buyerId, tenantId) {
        const feePercent = parseInt(process.env.PLATFORM_FEE_PERCENT || '5', 10);
        const platformFee = Math.round(dto.amount * (feePercent / 100));
        const transaction = await this.prisma.transaction.create({
            data: {
                amount: dto.amount,
                currency: dto.currency || 'usd',
                description: dto.description,
                platformFee,
                buyerId,
                providerId: dto.providerId,
                tenantId,
                status: client_1.TransactionStatus.CREATED,
            },
            include: { buyer: { select: { id: true, name: true, email: true } }, provider: { select: { id: true, name: true, email: true } } },
        });
        await this.prisma.transactionStateHistory.create({
            data: {
                transactionId: transaction.id,
                fromState: client_1.TransactionStatus.CREATED,
                toState: client_1.TransactionStatus.CREATED,
                reason: 'Transaction created',
                changedBy: buyerId,
            },
        });
        return transaction;
    }
    async findAll(tenantId, filters) {
        return this.prisma.transaction.findMany({
            where: {
                tenantId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.buyerId && { buyerId: filters.buyerId }),
                ...(filters?.providerId && { providerId: filters.providerId }),
            },
            include: {
                buyer: { select: { id: true, name: true, email: true } },
                provider: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id, tenantId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id, tenantId },
            include: {
                buyer: { select: { id: true, name: true, email: true } },
                provider: { select: { id: true, name: true, email: true } },
                stateHistory: { orderBy: { createdAt: 'asc' } },
                disputes: true,
                payouts: true,
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async transition(id, dto, userId, tenantId) {
        const transaction = await this.findById(id, tenantId);
        this.stateMachine.validateTransition(transaction.status, dto.status);
        const updated = await this.prisma.transaction.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.status === client_1.TransactionStatus.HELD && {
                    holdUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }),
            },
            include: {
                buyer: { select: { id: true, name: true, email: true } },
                provider: { select: { id: true, name: true, email: true } },
            },
        });
        await this.prisma.transactionStateHistory.create({
            data: {
                transactionId: id,
                fromState: transaction.status,
                toState: dto.status,
                reason: dto.reason,
                changedBy: userId,
            },
        });
        if (dto.status === client_1.TransactionStatus.HELD && updated.holdUntil) {
            const delay = updated.holdUntil.getTime() - Date.now();
            await this.escrowQueue.add('auto-release', { transactionId: id, tenantId }, { delay });
        }
        return updated;
    }
    async getStateHistory(transactionId, tenantId) {
        await this.findById(transactionId, tenantId);
        return this.prisma.transactionStateHistory.findMany({
            where: { transactionId },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('escrow-timer')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_state_machine_1.TransactionStateMachine,
        bullmq_2.Queue])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map