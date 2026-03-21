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
exports.DisputesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transaction_state_machine_1 = require("../transactions/transaction-state-machine");
const client_1 = require("@prisma/client");
let DisputesService = class DisputesService {
    prisma;
    stateMachine;
    constructor(prisma, stateMachine) {
        this.prisma = prisma;
        this.stateMachine = stateMachine;
    }
    async create(dto, userId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: dto.transactionId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status !== client_1.TransactionStatus.HELD) {
            throw new common_1.BadRequestException('Can only dispute transactions in HELD status');
        }
        this.stateMachine.validateTransition(transaction.status, client_1.TransactionStatus.DISPUTED);
        const dispute = await this.prisma.dispute.create({
            data: {
                transactionId: dto.transactionId,
                raisedById: userId,
                reason: dto.reason,
                evidence: dto.evidence,
            },
            include: { transaction: true, raisedBy: { select: { id: true, name: true, email: true } } },
        });
        await this.prisma.transaction.update({
            where: { id: dto.transactionId },
            data: { status: client_1.TransactionStatus.DISPUTED },
        });
        await this.prisma.transactionStateHistory.create({
            data: {
                transactionId: dto.transactionId,
                fromState: client_1.TransactionStatus.HELD,
                toState: client_1.TransactionStatus.DISPUTED,
                reason: `Dispute raised: ${dto.reason}`,
                changedBy: userId,
            },
        });
        return dispute;
    }
    async findAll(filters) {
        return this.prisma.dispute.findMany({
            where: {
                ...(filters?.transactionId && { transactionId: filters.transactionId }),
                ...(filters?.status && { status: filters.status }),
            },
            include: {
                transaction: { select: { id: true, amount: true, status: true } },
                raisedBy: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id },
            include: {
                transaction: true,
                raisedBy: { select: { id: true, name: true, email: true } },
            },
        });
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        return dispute;
    }
    async resolve(id, dto, adminId) {
        const dispute = await this.findById(id);
        if (dispute.status !== client_1.DisputeStatus.OPEN && dispute.status !== client_1.DisputeStatus.UNDER_REVIEW) {
            throw new common_1.BadRequestException('Dispute is already resolved');
        }
        const updatedDispute = await this.prisma.dispute.update({
            where: { id },
            data: {
                status: dto.status,
                resolution: dto.resolution,
                resolvedAt: new Date(),
            },
            include: { transaction: true },
        });
        let newTransactionStatus;
        if (dto.status === client_1.DisputeStatus.RESOLVED_PROVIDER) {
            newTransactionStatus = client_1.TransactionStatus.RELEASED;
        }
        else if (dto.status === client_1.DisputeStatus.RESOLVED_BUYER) {
            newTransactionStatus = client_1.TransactionStatus.REFUNDED;
        }
        else {
            return updatedDispute;
        }
        this.stateMachine.validateTransition(dispute.transaction.status, newTransactionStatus);
        await this.prisma.transaction.update({
            where: { id: dispute.transactionId },
            data: { status: newTransactionStatus },
        });
        await this.prisma.transactionStateHistory.create({
            data: {
                transactionId: dispute.transactionId,
                fromState: dispute.transaction.status,
                toState: newTransactionStatus,
                reason: `Dispute resolved: ${dto.resolution}`,
                changedBy: adminId,
            },
        });
        return updatedDispute;
    }
};
exports.DisputesService = DisputesService;
exports.DisputesService = DisputesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_state_machine_1.TransactionStateMachine])
], DisputesService);
//# sourceMappingURL=disputes.service.js.map